const TimeRemaining = require('../util/systems/gameClock/gameClock');

// Mongoose Object Models
const { getFinance } = require('../models/gov/finance');

function connect(io){

  setInterval(() => {
    io.emit('gameClock', TimeRemaining());
  }, 1000);

  io.on('connection', (client) => {
    console.log(`New client connected... ${client.id}`);

    client.on('updatePR', async (teamID) => {
      console.log(`Got sent: ${teamID}`);
      let prUpdate = await getFinance(teamID);
      console.log(prUpdate);
      client.emit('prUpdate', prUpdate);
    });
      // client.on('subscribeToTimer', (interval) => {
      //     console.log(`Client has subscribed to timer with interval ${interval}`);
      //     setInterval(() => {
      //     client.emit('timer', interval--);
      //     }, interval);
      // });

    client.on('disconnect', () => console.log(`Client Disconnected... ${client.id}`));
  });
}

module.exports = connect;