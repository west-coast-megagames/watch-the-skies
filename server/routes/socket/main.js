const SocketServer = require('../../util/systems/socketServer'); // Client Tracking Object
const nexusEvent = require('../../middleware/events/events'); // Local event triggers
const socketDebugger = require('debug')('app:sockets:main');
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling

// Watch the Skies game functions
const gameClock = require('../../wts/gameClock/gameClock');
const banking = require('../../wts/banking/banking');
const { addUpgrade, removeUpgrade, repairUpgrade } = require('../../wts/upgrades/upgrades');
const { newUpgrade } = require('../../wts/construction/construction');

let msgKey = 0;

module.exports = function (io) {
	const MainClients = new SocketServer;

	io.on('connection', (client) => {
		logger.info(`New client subscribing to main socket... ${client.id}`);
		MainClients.connections.push(client);
		logger.info(`${MainClients.connections.length} ${MainClients.connections.length === 1 ? 'client' : 'clients'} subscribed to main socket server...`);

		client.on('new user', (data) => {
			MainClients.saveUser(data, client);
			logger.info(`${data.user} for the ${data.team} have been registered on the main socket...`);
		});

		client.on('chat msg', (data) => {
			data.key = msgKey;
			msgKey++;
			io.sockets.emit('new msg', data);
		});

		client.on('clockSocket', data => { // all game clock sockets in one dyamic one -Scott
			switch(data) {
			case 'pauseGame':
				gameClock.pauseClock();
				break;
			case 'startGame':
				gameClock.startClock();
				break;
			case 'resetClock':
				gameClock.resetClock();
				break;
			case 'skipPhase':
				gameClock.skipPhase();
				break;
			default:
				console.log('Bad clockSocket Request: ', data); // need an error socket to trigger
				break;
			}
		});

		client.on('upgradeSocket', async (type, data) => { // all game clock sockets in one dyamic one -Scott
			logger.info(`upgradeSocket triggered: ''${type}''`);
			let response;
			switch(type) {
			case 'add': {
				response = await addUpgrade(data);
				break;
			}
			case 'remove': {
				response = await removeUpgrade(data);
				break;
			}
			case 'build': {
				response = await newUpgrade(data); // just the facility ID
				break;
			}
			case 'repair': {
				response = await repairUpgrade(data); // just the facility ID
				break;
			}
			default:
				console.log('Bad upgradeSocket Request: ', type); // need an error socket to trigger
				client.emit('alert', { message : `Bad upgradeSocket Request: ${type}`, type: 'error' });
				break;
			}
			client.emit('alert', response);
			nexusEvent.emit('updateUpgrades');
			nexusEvent.emit('updateMilitary');
		});

		client.on('bankingTransfer', async (transfer) => {
			const { to, from, amount, note } = transfer;

			if (to === from) {
				const err = 'Someone tried to send money to themselves';
				return nexusEvent.emit('error', err);
			}

			socketDebugger(transfer);
			await banking.transfer(to, from, amount, note);

			nexusEvent.emit('updateAccounts');
			nexusEvent.emit('updateLogs');
		});

		client.on('autoTransfer', async (transfer) => {
			const { to, from, amount, note } = transfer;
			socketDebugger(transfer);
			await banking.setAutoTransfer(to, from, amount, note);

			nexusEvent.emit('updateAccounts');
		});

		client.on('disconnect', () => {
			logger.info(`Client disconnecting from update service... ${client.id}`);
			MainClients.delClient(client);
			socketDebugger(`${MainClients.connections.length} clients connected`);
		});
	});
};