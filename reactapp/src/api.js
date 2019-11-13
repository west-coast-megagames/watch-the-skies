import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:5000');

function subscribeToTimer (interval, cb) {
    socket.on('timer', timestamp => cb(null, timestamp));
    socket.emit('subscribeToTimer', 1000);
};

function subscribeToClock (cb) {
    socket.on('gameClock', count => cb(null, count));
    // socket.emit('gameClock');
};

function updatePR (team) {
    let update = setInterval(() => {
        socket.emit('updatePR', team);
        clearInterval(update);
    }, 4000);
};

function prUpdate (cb) {
    socket.on('prUpdate', data => cb(null, data));
};

function pauseGame () {
    socket.emit('pauseGame');
};

function startGame () {
    socket.emit('startGame')
};

export { subscribeToTimer, subscribeToClock, updatePR, prUpdate, pauseGame, startGame };