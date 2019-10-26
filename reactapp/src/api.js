import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:5000');

function subscribeToTimer (interval, cb) {
    socket.on('timer', timestamp => cb(null, timestamp));
    socket.emit('subscribeToTimer', 1000);
}

function subscribeToClock (interval, cb) {
    socket.on('counter', count => cb(null, count));
}

export { subscribeToTimer, subscribeToClock };