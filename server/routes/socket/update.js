const SocketServer = require('../../util/systems/socketServer') // Client Tracking Object
const nexusEvent = require('../../startup/events'); // Local event triggers
const socketDebugger = require('debug')('app:sockets:update');
const { logger } = require('../../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling

// Mongoose Object Models & Methods
const { getTeam } = require('../../models/team');
const { getAircrafts } = require('../../models/ops/aircraft');
const { Account } = require('../../models/gov/account');

module.exports = function(io) {
    let UpdateClients = new SocketServer

    io.of('/update').on('connection', (client) => {
        logger.info(`New client subscribing to update socket... ${client.id}`);
        UpdateClients.connections.push(client);
        logger.info(`${UpdateClients.connections.length} ${UpdateClients.connections.length === 1 ? 'client' : 'clients'} subscribed to update service...`);

        client.on('new user', (data) => {
            UpdateClients.saveTeam(data.team, client);
            UpdateClients.saveUser(data.user, client);
            logger.info(`${data.user} for the ${data.team} have been registered as gameclock subscribers...`)
        });

        nexusEvent.on('updateAccounts', async () => {
            let accounts = await Account.find();
            socketDebugger('Updating financial accounts...');
            client.emit('updateAccounts', accounts);
          });

        nexusEvent.on('updateAircrafts', async () => {
            let aircrafts = await getAircrafts();
            socketDebugger('Updating aircrafts...');
            client.emit('currentAircrafts', aircrafts);
        });
      
        nexusEvent.on('updateTeam', async (team_id) => {
            socketDebugger(`Event: Team update for ${team_id} needed...`);
            let team = await getTeam(team_id);
            client.emit('teamUpdate', team);
        });

        client.on('disconnect', () => {
            logger.info(`Client disconnecting from update service... ${client.id}`);
            UpdateClients.delClient(client);
            console.log( `${UpdateClients.connections.length} clients connected`);
          });
    })
}