const turnChange = require('./turnChange');

let gameActive = false;

let minutes = 0;
let seconds = 0;
let hours = 0;

let phaseTimes = [.08, .12, .10];
let phaseTime = .5;
let currentTime = Date.parse(new Date());
let deadline = new Date(currentTime + phaseTime*60*1000);

let gamePhases = ['Team Phase', 'Action Phase', 'Free Phase'];
let phaseNum = 0;
let currentPhase = gamePhases[phaseNum];

let quarters = ['Jan-Mar', 'Apr-Jun', 'Jul-Sept', 'Oct-Dec'];
let year = 2020;
let quarter = -1;
let currentTurn = 'Pre-Game';
let turnNum = 0;

// setTimeout(startClock, 4000)
// setTimeout(pauseClock, 15000)
// setTimeout(startClock, 22000)

function startClock() {
    console.warn('Game has been started!');
    gameActive = true;
};

function pauseClock() {
    console.warn('Game has been paused!');
    gameActive = false;
    currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + (seconds * 1000) + (minutes * 1000 * 60));
};

// setInterval(() => {
//     let timeRemaining = getTimeRemaining();
//     let { minutes, seconds, phase, turn } = timeRemaining;
//     console.log(`Current Time: ${minutes}:${seconds} | ${phase} ${turn}`)
// }, 1000);

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

    if(minutes <= 0 && seconds <= 0 && gameActive) {
        currentTime = Date.parse(new Date());
        deadline = new Date(currentTime + phaseTime*60*1000);

        if (phaseNum == 2) {
            phaseNum = 0;
            incrementTurn();
        } else {
            phaseNum++
        };
        currentPhase = gamePhases[phaseNum];
        phaseTime = phaseTimes[phaseNum];
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

function incrementTurn() {
    turnNum++;
    if (quarter == 3) {
        quarter = 0;
        year++;
    } else {
        quarter++;

    }

    currentTurn = `${quarters[quarter]} ${year}`
    turnChange(currentTurn);

    return 0;
};

module.exports = { getTimeRemaining, pauseClock, startClock };