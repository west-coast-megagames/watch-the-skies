import openSocket from 'socket.io-client';

// Socket Routes
const socket = openSocket('http://localhost:5000');
const alert = openSocket('http://localhost:5000/alert');

// Update Socket Events and Event Listners
function updateTeam (teamID) {
    let updateTeam = setInterval(() => {
        socket.emit('updateTeam', teamID);
        clearInterval(updateTeam);
    }, 1000);
};

function teamUpdate (cb) {
    socket.on('teamUpdate', data => cb(null, data));
};

let teamEvents = { updateTeam, teamUpdate };

// Clock Socket Events and Event Listners
function subscribeToClock (cb) {
    socket.on('gameClock', clock => cb(null, clock));
};

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
};

let gameClock = { subscribeToClock, pauseGame, startGame, resetClock, skipPhase };

// Banking Socket Events and Event Listners
function bankingTransfer (transfer) {
    socket.emit('bankingTransfer', transfer);
};

function autoTransfer (transfer) {
    socket.emit('autoTransfer', transfer);
};

let banking = { bankingTransfer, autoTransfer };

// Notification Socket Events and Event Listners
function alertListen (cb) {
    alert.on('alert', data => cb(null, data))
};

let alerts = { alertListen };

function updateAircrafts () {
    console.log('Reciving updating aircrafts...');
    socket.emit('updateAircrafts');
}

function currentAircrafts (cb) {
    console.log('Listning for current aircrafts...')
    socket.on('currentAircrafts', data => cb(null, data));
};

export { gameClock, banking, alerts, teamEvents, currentAircrafts, updateAircrafts };