const socketio = require('socket.io');
const TimeRemaining = require('../util/systems/gameClock/gameClock')

function socketServer(server){
    let io = socketio.listen(server, () => console.log(`socket.io listining...`));

    io.on('connection', (client) => {
        console.log('New client connected...');

        client.on('gameClock', () => {
          setInterval(() => {
            client.emit('roundTimer', TimeRemaining());
          });
        })

        client.on('subscribeToTimer', (interval) => {
            console.log(`Client has subscribed to timer with interval ${interval}`);
            setInterval(() => {
            client.emit('timer', interval--);
            }, interval);
        });

        client.on('disconnect', () => console.log('Client Disconnected...'));
    });
}

module.exports = socketServer;