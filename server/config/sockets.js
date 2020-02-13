const gameClock = require('../wts/gameClock/gameClock');
const banking = require('../wts/banking/banking');
const socketDebugger = require('debug')('app:sockets');
const { logger } = require('../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling

const nexusEvent = require('../startup/events');
const events = require('events')
const eventListner = new events.EventEmitter();

// Mongoose Object Models
const { Team, getPR, getTeam } = require('../models/team');
const { getAircrafts } = require('../models/ops/aircraft');
const { Account } = require('../models/gov/account');

class Client {
  constructor() {
      this.connections = [];
      this.saveClient = this.saveClient.bind(this);
      this.delClient = this.saveClient.bind(this);
  }
  saveClient (team, client) {
      client.team = team;
      this.connections.push(client);
  }
  delClient (client) {
      this.connections.splice(connections.indexOf(client), 1);
  }
}

let connections = [];
let msgKey = 0;

// Team.watch().on('change', data => {
//   socketDebugger(data);
// });

// Account.watch().on('change', async data => {
//   socketDebugger(data);
//   let id = data.documentKey._id;
//   let account = await Account.findById(id);
//   let team = await Team.findById(account.team_id);
//   eventListner.emit('updateAccounts', team);
// });


  /*
  setInterval(() => {
    io.emit('gameClock', gameClock.getTimeRemaining());
  }, 1000);
  */

module.exports = function (io){
  nexusEvent.on('updateAircrafts', async () => {
    let aircrafts = await getAircrafts();
    socketDebugger('Sending Aircrafts!');
    io.emit('currentAircrafts', aircrafts);
  });

  io.on('connection', (client) => {
    logger.info(`New client connected... ${client.id}`);
    connections.push(client);
    logger.info(`${connections.length} ${connections.length === 1 ? 'client' : 'clients'} connected...`);
    
    let gClock = setInterval(() => {
      client.emit('gameClock', gameClock.getTimeRemaining());
    }, 1000);

    client.on('chat msg', (data) => {
      data.key = msgKey;
      msgKey++;
      io.sockets.emit('new msg', data);
    })

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

    nexusEvent.on('updateAccounts', async () => {
      let accounts = await Account.find();
      socketDebugger('Sending Accounts!');
      client.emit('updateAccounts', accounts);
    });

    client.on('disconnect', () => {
      logger.info(`Client Disconnected... ${client.id}`);
      connections.splice(connections.indexOf(client), 1);
      console.log( `${connections.length} clients connected`);
      clearInterval(gClock);
    });
  });
};