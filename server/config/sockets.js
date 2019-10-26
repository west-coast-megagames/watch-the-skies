const socketio = require('socket.io');

function socketServer(server){
    let io = socketio.listen(server, () => console.log(`socket.io started on port ${ioport}...`));

    io.on('connection', (client) => {
        console.log('New client connected...');
        let counter = 100;
        let WinnerCountdown = setInterval(function(){
          io.emit('counter', counter);
          counter--
          if (counter === 0) {
            io.emit('counter', "Congratulations You WON!!");
            clearInterval(WinnerCountdown);
          }
        }, 1000);

        client.on('subscribeToTimer', (interval) => {
            console.log(`Client has subscribed to timer with interval ${interval}`);
            setInterval(() => {
            client.emit('timer', interval--);
            }, interval);
        });

        client.on('disconnect', () => console.log('Client Disconnected...'));
    });
}

// function setTimer(t) {
//     let seconds = Math.floor( (t/1000) % 60 );
//     let minutes = Math.floor( (t/1000/60) % 60 );
// }

// function gameTimer(t) {
//     let seconds = Math.floor( (t/1000) % 60 );
//     let minutes = Math.floor( (t/1000/60) % 60 );

//     let time = setInterval(seconds, minutes, (seconds, minutes) => {
//         if (seconds != 0) {
//             seconds = seconds -1;
//         } else {
//             minutes = minutes -1;
//             seconds = 59;
//         }
//         let time = `${minutes} : ${seconds}`;
//         return time;
//     }, 1000)
//     return time;
// }

module.exports = socketServer;