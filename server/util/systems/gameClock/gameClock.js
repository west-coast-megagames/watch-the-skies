let gameActive = true;

let roundTime = .09;
let currentTime = Date.parse(new Date());
let deadline = new Date(currentTime + roundTime*60*1000);

let gamePhases = ['Team Phase', 'Action Phase', 'Free Phase'];
let phaseNum = 0;
let currentPhase = gamePhases[phaseNum];

let quarters = ['Jan-Mar', 'Apr-Jun', 'Jul-Sept', 'Oct-Dec'];
let year = 2020;
let quarter = -1;
let currentTurn = 'Test Turn';

if (gameActive) {
    setInterval(() => {
        let timeRemaining = getTimeRemaining();
        let { minutes, seconds, phase, turn } = timeRemaining;
        // console.log(`Current Time: ${minutes}:${seconds} | ${phase} ${turn}`)
    }, 1000);
}

function getTimeRemaining(){
    let t = Date.parse(deadline) - Date.parse(new Date());
    let seconds = Math.floor( (t/1000) % 60 );
    let minutes = Math.floor( (t/1000/60) % 60 );
    //let hours = Math.floor( (t/(1000*60*60)) % 24 );
    //let days = Math.floor( t/(1000*60*60*24) );
    
    if(minutes < 0 && seconds < 0) {
        currentTime = Date.parse(new Date());
        deadline = new Date(currentTime + roundTime*60*1000);

        if (phaseNum == 2) {
            phaseNum = 0;
            incrementTurn();
        } else {
            phaseNum++
        };

        currentPhase = gamePhases[phaseNum];
    }

    return {
      'minutes': minutes,
      'seconds': seconds,
      'phase' : currentPhase,
      'turn' : currentTurn
    };
}

function incrementTurn() {
    if (quarter == 3) {
        quarter = 0;
        year++;
    } else {
        quarter++;
    }

    currentTurn = `${quarters[quarter]} ${year}`

    return 0;
};

module.exports = getTimeRemaining;