const SocketServer = require('../../util/systems/socketServer') // Client Tracking Object
const nexusEvent = require('../../startup/events'); // Local event triggers
const socketDebugger = require('debug')('app:sockets:clock');
const { logger } = require('../../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling

const gameClock = require('../../wts/gameClock/gameClock');

module.exports = function(io) {
    let ClockClients = new SocketServer

    io.of('/clock').on('connection', (client) => {
        logger.info(`New client subscribing to clock... ${client.id}`);
        ClockClients.connections.push(client);
        logger.info(`${ClockClients.connections.length} ${ClockClients.connections.length === 1 ? 'client' : 'clients'} subscribed to game clock...`);

        client.on('new user', (data) => {
            UpdateClients.saveUser(data, client);
            logger.info(`${data.user} for the ${data.team} have been registered as gameclock subscribers...`)
        });

        let gClock = setInterval(() => {
            client.emit('gameClock', gameClock.getTimeRemaining());
          }, 1000);

        client.on('disconnect', () => {
            logger.info(`Client disconnecting from game clock... ${client.id}`);
            ClockClients.delClient(client);
            console.log( `${ClockClients.connections.length} clients connected`);
            clearInterval(gClock);
          });
    })
}