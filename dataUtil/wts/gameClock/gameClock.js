const { logger } = require("../../middleware/winston"); // IMPORT - Server logger
const { teamPhase, actionPhase, freePhase } = require("./phaseChange"); // IMPORT - Phase change functions
const clockDebugger = require("debug")("app:gameClock"); // Debug console logger

let gameActive = false; // Current state of master game clock

let days = 0; // Starting days on master game clock
let hours = 0; // Starting hours on master game clock
let minutes = 40; // Starting minutes on master game clock
let seconds = 0; // Starting seconds on master game clock

let phaseTimes = [10, 12, 8]; // The amount of minutes in each phase
let phaseTime = 0; // Current time left in the Phase
let currentTime = Date.parse(new Date()); // Current Computer Date
let deadline = new Date(currentTime + phaseTime * 60 * 1000); // Time for End of Phase

let gamePhases = ["Team Phase", "Action Phase", "Free Phase"]; // Game Phases
let phaseNum = -1; // Current Phase Number
let currentPhase = "Briefing"; // Current Phase Name

let quarters = ["Jan-Mar", "Apr-Jun", "Jul-Sept", "Oct-Dec"]; // Quarter Names
let year = 2024; // Current Game Year
let quarter = -1; // Current Quarter
let currentTurn = "Pre-Game"; // Current Turn Name
let turnNum = 0; // Current turn Number

// Console Log of the Game Clock
// setInterval(() => {
//     let timeRemaining = getTimeRemaining();
//     let { minutes, seconds, phase, turn } = timeRemaining;
//     clockDebugger(`Current Time: ${minutes}:${seconds} | ${phase} ${turn}`)
// }, 1000);

// FUNCTION - startClock { IN: N/A, OUT: N/A }
// PROCESS: Sets gameActive state to true, and increments the turn if the clock is at 00:00
function startClock() {
  logger.info("Game has been started...");
  if (minutes <= 0 && seconds <= 0 && gameActive) {
    incrementPhase();
  }
  gameActive = true;
}

// FUNCTION - pauseClock { IN: N/A, OUT: N/A }
// PROCESS: Sets gameActive state to false, and updates current time and deadline to maintain the same time.
function pauseClock() {
  logger.info("Game has been paused...");
  gameActive = false;
  currentTime = Date.parse(new Date());
  deadline = new Date(currentTime + seconds * 1000 + minutes * 1000 * 60);
}

// FUNCTION - skipPhase { IN: N/A, OUT: N/A }
// PROCESS: Sets game state to the next phase sets the clock to that phases turn length
function skipPhase() {
  logger.info("Skipping to next phase...");
  incrementPhase();
  minutes = phaseTimes[phaseNum];
  seconds = 0;
}

// FUNCTION - resetClock { IN: N/A, OUT: N/A }
// PROCESS: Resets game state to the starting state
function resetClock() {
  logger.info("The game clock has been reset!");
  gameActive = false;
  minutes = 40;
  seconds = 0;

  phaseNum = 0;
  currentPhase = "Briefing";

  year = 2024;
  quarter = 0;
  currentTurn = "Pre-Game";
  turnNum = 0;
}

// FUNCTION - getTimeRemaining [RENAME] { IN: N/A, OUT: clock Object { seconds, minutes, phase, turn, turnNum } }
// PROCESS: Gives the current time, phase, turn, and turn number from the game clock
function getTimeRemaining() {
  if (!gameActive) {
    currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + seconds * 1000 + minutes * 1000 * 60);
  }

  let t = Date.parse(deadline) - Date.parse(new Date());
  seconds = Math.floor((t / 1000) % 60);
  minutes = Math.floor((t / 1000 / 60) % 60);
  hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  //let days = Math.floor( t/(1000*60*60*24) );

  if (minutes <= 0 && seconds <= 0 && gameActive) {
    incrementPhase();
  }

  seconds = seconds < 10 ? "0" + seconds : seconds;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return {
    minutes: minutes,
    seconds: seconds,
    phase: currentPhase,
    turn: currentTurn,
    turnNum: turnNum,
  };
}

// FUNCTION - incrementPhase { IN: N/A, OUT: N/A }
// PROCESS: Changes the game state to the next phase
function incrementPhase() {
  if (currentPhase === "Briefing" || currentTurn === "Pre-Game") {
    logger.info("Watch the Skies has begun!");
    quarter = 0;
    phaseNum = 0;
    turnNum++;
    currentTurn = `${quarters[quarter]} ${year}`;

    currentPhase = gamePhases[phaseNum];
    phaseTime = phaseTimes[phaseNum];
  } else {
    if (phaseNum == 2) {
      phaseNum = 0;
      incrementTurn();
    } else {
      phaseNum++;
    }
    currentPhase = gamePhases[phaseNum];
    phaseTime = phaseTimes[phaseNum];
  }

  if (currentPhase === "Team Phase") teamPhase(currentTurn);
  if (currentPhase === "Action Phase") actionPhase(currentTurn);
  if (currentPhase === "Free Phase") freePhase(currentTurn);

  currentTime = Date.parse(new Date());
  deadline = new Date(currentTime + phaseTime * 60 * 1000);
}

// FUNCTION - incrementTurn { IN: N/A, OUT: N/A }
// PROCESS: Changes the game state to the next turn
function incrementTurn() {
  turnNum++;
  if (quarter == 3) {
    quarter = 0;
    year++;
  } else {
    quarter++;
  }

  currentTurn = `${quarters[quarter]} ${year}`;
  return 0;
}

module.exports = {
  getTimeRemaining,
  pauseClock,
  startClock,
  skipPhase,
  resetClock,
};
