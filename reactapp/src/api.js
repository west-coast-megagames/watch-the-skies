import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:5000');

function subscribeToTimer (interval, cb) {
    socket.on('timer', timestamp => cb(null, timestamp));
    socket.emit('subscribeToTimer', 1000);
};

function subscribeToClock (cb) {
    socket.on('gameClock', count => cb(null, count));
};

function updateAccounts (team) {
    let updateAccounts = setInterval(() => {
        socket.emit('updateAccounts', team);
        clearInterval(updateAccounts);
    }, 1000);
};

function updatePR (team) {
    let updatePR = setInterval(() => {
        socket.emit('updatePR', team);
        clearInterval(updatePR);
    }, 1000);
};

function prUpdate (cb) {
    socket.on('prUpdate', data => cb(null, data));
};

function accountsUpdate (cb) {
    socket.on('accountsUpdate', data => cb(null, data));
}

function pauseGame () {
    socket.emit('pauseGame');
};

function startGame () {
    socket.emit('startGame')
};

function resetClock () {
    socket.emit('resetClock')
};

function bankingTransfer (transfer) {
    socket.emit('bankingTransfer', transfer)
};

export {
    subscribeToTimer,
    subscribeToClock,
    updatePR,
    updateAccounts,
    prUpdate,
    accountsUpdate,
    pauseGame,
    startGame,
    resetClock,
    bankingTransfer
};