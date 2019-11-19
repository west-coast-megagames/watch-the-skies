const gameClock = require('../util/systems/gameClock/gameClock');
const socketDebugger = require('debug')('app:sockets');

// Mongoose Object Models
const { getPR, getAccounts } = require('../models/team');

function connect(io){

  setInterval(() => {
    io.emit('gameClock', gameClock.getTimeRemaining());
  }, 1000);

  io.on('connection', (client) => {
    console.log(`New client connected... ${client.id}`);

    client.on('updatePR', async (teamID) => {
      socketDebugger(`${client.id} requested updated PR for ${teamID}`);
      let prUpdate = await getPR(teamID);
      client.emit('prUpdate', prUpdate);
    });

    client.on('updateAccounts', async (teamID) => {
      socketDebugger(`${client.id} requested updated accounts for ${teamID}`);
      let accounts = await getAccounts(teamID);
      client.emit('accountsUpdate', accounts);
    });

    client.on('pauseGame', () => {
      gameClock.pauseClock();
    });

    client.on('startGame', () => {
      gameClock.startClock();
    });

    client.on('resetClock', () => {
      gameClock.resetClock();
    });

    client.on('disconnect', () => console.log(`Client Disconnected... ${client.id}`));
  });
};

module.exports = connect;