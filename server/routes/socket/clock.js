const SocketServer = require('../../util/systems/socketServer'); // Client Tracking Object
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling

const gameClock = require('../../wts/gameClock/gameClock');

module.exports = function (io) {
	const ClockClients = new SocketServer;

	io.of('/clock').on('connection', (client) => {
		logger.info(`New client subscribing to clock... ${client.id}`);
		ClockClients.connections.push(client);
		logger.info(`${ClockClients.connections.length} ${ClockClients.connections.length === 1 ? 'client' : 'clients'} subscribed to game clock...`);

		client.on('new user', (data) => {
			ClockClients.saveUser(data, client);
			logger.info(`${data.user} for the ${data.team} have been registered as gameclock subscribers...`);
		});

		const gClock = setInterval(() => {
			client.emit('gameClock', gameClock.getTimeRemaining());
		}, 1000);

		client.on('disconnect', () => {
			logger.info(`Client disconnecting from game clock... ${client.id}`);
			ClockClients.delClient(client);
			console.log(`${ClockClients.connections.length} clients connected`);
			clearInterval(gClock);
		});
	});
};