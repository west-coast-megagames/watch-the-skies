const SocketServer = require('../../util/systems/socketServer') // Client Tracking Object
const nexusEvent = require('../../startup/events'); // Local event triggers
const socketDebugger = require('debug')('app:sockets:main');
const { logger } = require('../../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling

// Watch the Skies game functions
const gameClock = require('../../wts/gameClock/gameClock');
const banking = require('../../wts/banking/banking');

let msgKey = 0;

module.exports = function(io) {
    let MainClients = new SocketServer

    io.on('connection', (client) => {
        logger.info(`New client subscribing to main socket... ${client.id}`);
        MainClients.connections.push(client);
        logger.info(`${MainClients.connections.length} ${MainClients.connections.length === 1 ? 'client' : 'clients'} subscribed to update service...`);

        client.on('new user', (data) => {
            MainClients.saveTeam(data.team, client);
            MainClients.saveUser(data.user, client);
            logger.info(`${data.user} for the ${data.team} have been registered on the main socket...`)
        });

        client.on('chat msg', (data) => {
            data.key = msgKey;
            msgKey++;
            io.sockets.emit('new msg', data);
          })
    
        client.on('pauseGame', () => {
            gameClock.pauseClock();
        });
    
        client.on('startGame', () => {
            gameClock.startClock();
        });
    
        client.on('resetClock', () => {
            gameClock.resetClock();
        });
    
        client.on('skipPhase', () => {
            gameClock.skipPhase();
        });
    
        client.on('bankingTransfer', async (transfer) => {
            let { to, from, amount, note } = transfer;
            socketDebugger(transfer);
            await banking.transfer(to, from, amount, note);

            nexusEvent.emit('updateAccounts');
        });

        client.on('disconnect', () => {
            logger.info(`Client disconnecting from update service... ${client.id}`);
            MainClients.delClient(client);
            socketDebugger( `${MainClients.connections.length} clients connected`);
          });
    })
}