const socketio = require('socket.io');

function socketServer(server){
    let io = socketio.listen(server, () => console.log(`socket.io started on port ${ioport}...`));
    

    io.on('connection', (client) => {
        console.log('New client connected...');
        client.on('subscribeToTimer', (interval) => {
            console.log(`Client has subscribed to timer with interval ${interval}`);
            setInterval(() => {
            client.emit('timer', new Date());
            }, interval);
        });
        client.on('disconnect', () => console.log('Client Disconnected...'));
    });
}

module.exports = socketServer;