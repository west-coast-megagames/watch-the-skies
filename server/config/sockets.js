const gameClock = require('../util/systems/gameClock/gameClock');
const banking = require('../util/systems/banking/banking');
const socketDebugger = require('debug')('app:sockets');

const events = require('events')
const eventListner = new events.EventEmitter();

// Mongoose Object Models
const { Team, getPR, getTeam } = require('../models/team');
const { Interceptor, getAircrafts } = require('../models/ops/interceptor');

Interceptor.watch().on('change', data => {
  socketDebugger(new Date(), data);
  eventListner.emit('updateAircrafts');
});

Team.watch().on('change', data => {
  socketDebugger(data);
});

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

    client.on('updateTeam', async (teamID) => {
      socketDebugger(`${client.id} requested updated team information for ${teamID}`);
      let team = await getTeam(teamID);
      client.emit('teamUpdate', team);
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

    client.on('skipPhase', () => {
      gameClock.skipPhase();
    });

    client.on('bankingTransfer', (transfer) => {
      let { to, from, amount, teamID, note } = transfer;
      banking.transfer(teamID, to, from, amount, note);
    });

    client.on('autoTransfer', (transfer) => {
      let { to, from, amount, teamID, note } = transfer;
      banking.setAutoTransfer(teamID, to, from, amount, note);
    });

    client.on('updateAircrafts', async () => {
      socketDebugger(`${client.id} requested updated aircrafts...`);
      eventListner.emit('updateAircrafts');
    });

    eventListner.on('updateAircrafts', async () => {
      let aircrafts = await getAircrafts();
      socketDebugger('Sending Aircrafts!');
      client.emit('currentAircrafts', aircrafts);
    });
    

    client.on('disconnect', () => console.log(`Client Disconnected... ${client.id}`));
  });
};

module.exports = connect;