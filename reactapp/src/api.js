import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:5000');
const alert = openSocket('http://localhost:5000/alert');

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
    socket.emit('startGame');
};

function resetClock () {
    socket.emit('resetClock');
};

function skipPhase () {
    socket.emit('skipPhase');
}

function bankingTransfer (transfer) {
    socket.emit('bankingTransfer', transfer);
};

function alertListen (cb) {
    alert.on('alert', data => cb(null, data))
}

let clock = {
    subscribeToClock,
    pauseGame,
    startGame,
    resetClock,
    skipPhase
};

let banking = {
    updatePR,
    updateAccounts,
    prUpdate,
    accountsUpdate,
    bankingTransfer
}

let alerts = {
    alertListen
}

export { clock, banking, alerts };