const gameClock = require('../wts/gameClock/gameClock');
const banking = require('../wts/banking/banking');
const socketDebugger = require('debug')('app:sockets');
const { logger } = require('../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling

const events = require('events')
const eventListner = new events.EventEmitter();

// Mongoose Object Models
const { Team, getPR, getTeam } = require('../models/team');
const { Interceptor, getAircrafts } = require('../models/ops/interceptor');
const { Account } = require('../models/gov/account');

Interceptor.watch().on('change', data => {
  socketDebugger(new Date(), data);
  eventListner.emit('updateAircrafts');
});

Team.watch().on('change', data => {
  socketDebugger(data);
});

Account.watch().on('change', async data => {
  socketDebugger(data);
  let id = data.documentKey._id;
  let account = await Account.findById(id);
  let team = await Team.findById(account.team_id);
  eventListner.emit('updateAccounts', team);
});

module.exports = function (io){
  setInterval(() => {
    io.emit('gameClock', gameClock.getTimeRemaining());
  }, 1000);

  io.on('connection', (client) => {
    logger.info(`New client connected... ${client.id}`);

    client.on('updatePR', async (team_id) => {
      socketDebugger(`${client.id} requested updated PR for ${team_id}`);
      let prUpdate = await getPR(team_id);
      client.emit('prUpdate', prUpdate);
    });

    client.on('updateTeam', async (team_id) => {
      socketDebugger(`${client.id} requested updated team information for ${team_id}`);
      let team = await getTeam(team_id);
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
      let { to, from, amount, note } = transfer;
      socketDebugger(transfer);
      banking.transfer(to, from, amount, note);
    });

    client.on('autoTransfer', (transfer) => {
      let { to, from, amount, note } = transfer;
      banking.setAutoTransfer(to, from, amount, note);
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

    client.on('disconnect', () => logger.info(`Client Disconnected... ${client.id}`));
  });
};