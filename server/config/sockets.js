const socketio = require('socket.io');

function socketServer(server){
    let io = socketio.listen(server, () => console.log(`socket.io started on port ${ioport}...`));


    io.on('connection', (client) => {
        console.log('New client connected...');

        client.on('gameClock', () => {
          setInterval(() => {
            client.emit('roundTimer', getTimeRemaining());
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

let roundTime = 15;
let currentTime = Date.parse(new Date());
let deadline = new Date(currentTime + roundTime*60*1000);

function getTimeRemaining(){
    let t = Date.parse(deadline) - Date.parse(new Date());
    let seconds = Math.floor( (t/1000) % 60 );
    let minutes = Math.floor( (t/1000/60) % 60 );
    //let hours = Math.floor( (t/(1000*60*60)) % 24 );
    //let days = Math.floor( t/(1000*60*60*24) );

    return {
      'minutes': minutes,
      'seconds': seconds
    };
}

module.exports = socketServer;