const { teamPhase, actionPhase, freePhase } = require('./phaseChange');
const clockDebugger = require('debug')('app:gameClock');

let gameActive = false;

let minutes = .1;
let seconds = 0;
let hours = 0;

let phaseTimes = [8, 12, 10];
let phaseTime = 0;
let currentTime = Date.parse(new Date());
let deadline = new Date(currentTime + phaseTime*60*1000);

let gamePhases = ['Team Phase', 'Action Phase', 'Free Phase'];
let phaseNum = -1;
let currentPhase = 'Briefing';

let quarters = ['Jan-Mar', 'Apr-Jun', 'Jul-Sept', 'Oct-Dec'];
let year = 2020;
let quarter = -1;
let currentTurn = 'Pre-Game';
let turnNum = 0;

// setInterval(() => {
//     let timeRemaining = getTimeRemaining();
//     let { minutes, seconds, phase, turn } = timeRemaining;
//     clockDebugger(`Current Time: ${minutes}:${seconds} | ${phase} ${turn}`)
// }, 1000);

function startClock() {
    console.warn('Game has been started!');
    if(minutes <= 0 && seconds <= 0 && gameActive) {
        incrementPhase();
    }
    gameActive = true;
};

function pauseClock() {
    console.warn('Game has been paused!');
    gameActive = false;
    currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + (seconds * 1000) + (minutes * 1000 * 60));
};

function skipPhase() {
    console.warn('Skipping to next phase');
    incrementPhase();
};

function resetClock() {
    gameActive = false;
    minutes = .1;
    seconds = 0;
    
    phaseNum = -1;
    currentPhase = 'Breifing';

    year = 2020;
    quarter = -1;
    currentTurn = 'Pre-Game';
    turnNum = 0;
};

function getTimeRemaining(){
    if(!gameActive) {
        currentTime = Date.parse(new Date());
        deadline = new Date(currentTime + (seconds * 1000) + (minutes * 1000 * 60))
    };

    let t = Date.parse(deadline) - Date.parse(new Date());
    seconds = Math.floor( (t/1000) % 60 );
    minutes = Math.floor( (t/1000/60) % 60 );
    hours = Math.floor( (t/(1000*60*60)) % 24 );
    //let days = Math.floor( t/(1000*60*60*24) );

    if (minutes <= 0 && seconds <= 0 && gameActive) {
        incrementPhase();
    }

    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return {
      'minutes': minutes,
      'seconds': seconds,
      'phase': currentPhase,
      'turn': currentTurn,
      'turnNum': turnNum
    };
}

function incrementPhase() {
    if (currentPhase === 'Breifing') {
        quarter = 0;
        phaseNum = 0;
        currentTurn = `${quarters[quarter]} ${year}`
   } else if (phaseNum == 2) {
        phaseNum = 0;
        incrementTurn();
    } else {
        phaseNum++
    };
    currentPhase = gamePhases[phaseNum];
    phaseTime = phaseTimes[phaseNum];

    if (currentPhase === 'Team Phase') teamPhase(currentTurn); 
    if (currentPhase === 'Action Phase') actionPhase(currentTurn);
    if (currentPhase === 'Free Phase') freePhase(currentTurn);


    currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + phaseTime*60*1000);
}

function incrementTurn() {
    turnNum++;
    if (quarter == 3) {
        quarter = 0;
        year++;
    } else {
        quarter++;
    }

    currentTurn = `${quarters[quarter]} ${year}`
    return 0;
};

module.exports = { getTimeRemaining, pauseClock, startClock, skipPhase, resetClock };