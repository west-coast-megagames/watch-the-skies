const { logger } = require('../../middleware/log/winston'); // IMPORT - Server logger
const nexusEvent = require('../../middleware/events/events'); // Local event triggers

class GameTimer {
	constructor() {
		this.model = 'Clock';
		this.roundEnd = new Date(Date.now() + (1000 * this.seconds) + (1000 * 60 * this.minutes) + (1000 * 60 * 60 * this.hours));
		this.paused = true; // Current state of game clock

		this.hours = 1; // Remaining hours on master game clock (Only when paused)
		this.minutes = 0; // Remaining minutes on master game clock (Only when paused)
		this.seconds = 0; // Remaining seconds on master game clock (Only when paused)

		this.phaseNum = -1; // Current Phase Number
		this.turnNum = -1; // Current Turn Number
		this.currentTurn = 'Pre-Briefing'; // Current Turn Name
		this.currentPhase = 'Tech-Support'; // Current Phase Name
		this.year = 2024; // In game year

		this.phaseTimes = [10, 12, 8]; // The amount of minutes in each phase
		this.phaseNames = ['Team Phase', 'Action Phase', 'Free Phase']; // Game Phase Names
		this.turnNames = ['Jan-Mar', 'Apr-Jun', 'Jul-Sept', 'Oct-Dec']; // Turn Phase Names

		this.interval = undefined;
	}

	// [- Game Timer Methods -]

	// gameTick - Checks to see if the round is over;
	gameTick() {
		const now = new Date();
		if (this.roundEnd.getTime() < now.getTime()) {
			this.nextPhase();
		}
	}

	// Starts gameTicks at the set interval (Default to 1 second)
	go(interval = 1000) {
		this.interval = setInterval(() => {
			this.gameTick();
		}, interval);
		return;
	}

	// Stops gameTicks event
	stop() {
		clearInterval(this.interval);
		return;
	}

	pause() {
		if (!this.paused) {
			this.paused = true;
			this.stop();

			const now = new Date(Date.now());
			const t = Date.parse(this.roundEnd) - Date.parse(now);
			this.seconds = Math.floor((t / 1000) % 60);
			this.minutes = Math.floor((t / 1000 / 60) % 60);
			this.hours = Math.floor((t / (1000 * 60 * 60)) % 24);

			logger.info(`Game paused - ${this.getTimeRemaining()} remains on the clock!`);

			return;
		}
		else {
			throw Error('Game is already paused!');
		}
	}

	unpause() {
		if (this.paused) {
			this.paused = false;
			this.setHours(this.hours);
			this.addMinutes(this.minutes);
			this.addSeconds(this.seconds);
			this.go();

			logger.info(`Game unpaused - ${this.getTimeRemaining()} on the clock!`);

			return;
		}
		else {
			throw Error('Game is already running!');
		}
	}

	reset() {
		this.model = 'Clock';
		this.paused = true; // Current state of game clock

		this.hours = 1; // Remaining hours on master game clock (Only when paused)
		this.minutes = 0; // Remaining minutes on master game clock (Only when paused)
		this.seconds = 0; // Remaining seconds on master game clock (Only when paused)

		this.roundEnd = new Date(Date.now());
		this.phaseNum = -1; // Current Phase Number
		this.turnNum = -1; // Current Turn Number
		this.currentTurn = 'Pre-Briefing'; // Current Turn Name
		this.currentPhase = 'Tech-Support'; // Current Phase Name
		this.year = 2024; // In game year

		this.phaseTimes = [10, 12, 8]; // The amount of minutes in each phase
		this.phaseNames = ['Team Phase', 'Action Phase', 'Free Phase']; // Game Phase Names
		this.turnNames = ['Jan-Mar', 'Apr-Jun', 'Jul-Sept', 'Oct-Dec']; // Turn Phase Names

		this.interval = undefined;
		logger.info('The game clock has been reset!');

		return;
	}

	startGame() {
		if (this.turnNum < 0) {
			this.nextTurn();
			this.nextPhase();

			this.paused = false;

			this.go();
			logger.info(`The game has begun - ${this.getTimeRemaining()} on the clock!`);

			return;
		}
		else {
			throw Error('Game has already started!');
		}
	}

	nextPhase() {
		const lastPhase = this.getTimeStamp();
		if (this.phaseNum % this.phaseNames.length === this.phaseNames.length - 1) {
			this.nextTurn();
		}

		this.phaseNum++;
		this.currentPhase = this.phaseNames[this.phaseNum % this.phaseNames.length];
		this.setSeconds(this.phaseTimes[this.phaseNum % this.phaseTimes.length] * 60);
		nexusEvent.emit('phaseChange', { phase: this.currentPhase, lastPhase });
		logger.info(`${this.currentPhase} - ${this.getTimeRemaining()} on the clock!`);
		this.broadcastClock();

		return;
	}

	revertPhase() {
		if (this.phaseNum > 0) {
			if (this.phaseNum % this.phaseNames.length === 0) {
				this.revertTurn();
			}
			this.phaseNum--;
			this.currentPhase = this.phaseNames[this.phaseNum % this.phaseNames.length];
			this.setSeconds(this.phaseTimes[this.phaseNum % this.phaseTimes.length] * 60);
			logger.info(`${this.currentPhase} - ${this.getTimeRemaining()} on the clock!`);
			this.broadcastClock();

			return;
		}
		else {
			throw Error('Cannot revert, at start of game');
		}
	}

	nextTurn() {
		this.turnNum++;
		this.currentTurn = `${this.turnNames[this.turnNum % this.turnNames.length]}`;
		logger.info(`${this.currentTurn} has begun!`);

		return;
	}

	revertTurn() {
		if (this.turnNum > 0) {
			this.turnNum--;
			this.currentTurn = `${this.turnNames[this.turnNum % this.turnNames.length]} ${this.year}`;
			logger.info(`Reverted to ${this.currentTurn}`);
		}
		else {
			throw Error('Cannot revert, at start of game');
		}

		return;
	}

	getTimeRemaining() {
		const now = new Date(Date.now());
		let hours = this.hours;
		let minutes = this.minutes;
		let seconds = this.seconds;

		if(!this.paused) {
			const t = Date.parse(this.roundEnd) - Date.parse(now);
			seconds = Math.floor((t / 1000) % 60);
			minutes = Math.floor((t / 1000 / 60) % 60);
			hours = Math.floor((t / (1000 * 60 * 60)) % 24);
			// let days = Math.floor( t/(1000*60*60*24) );
		}
		seconds = seconds < 10 ? '0' + seconds : seconds;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		hours = hours < 10 ? '0' + hours : hours;

		return `${hours > 0 ? `${hours}:` : '' }${minutes}:${seconds}`;
	}

	getTimeStamp() {
		return { turn: this.currentTurn, phase: this.currentPhase, turnNum: this.turnNum, year: this.year, clock: this.getTimeRemaining() };
	}

	getClockState() {
		return {
			model: this.model,
			paused: this.paused,
			hours: this.hours,
			minutes: this.minutes,
			seconds: this.seconds,
			turn: this.currentTurn,
			phase: this.currentPhase,
			turnNum: this.turnNum,
			year: this.year,
			gameClock: this.getTimeRemaining(),
			deadline: this.roundEnd
		};
	}

	setSeconds(secs = 0) {
		this.roundEnd = new Date(Date.now());
		this.roundEnd.setSeconds(this.roundEnd.getSeconds() + secs);

		return;
	}

	setHours(hours = 0) {
		if (this.paused) {
			this.hours = hours;
		}
		else {
			this.setSeconds(hours * 60 * 60);
		}
	}

	setMinutes(mins = 0) {
		if (this.paused) {
			this.hours = mins;
		}
		else {
			this.setSeconds(mins * 60);
		}
	}

	addSeconds(secs = 0) {
		if (this.paused) {
			this.seconds += this.secs;
		}
		else {
			this.roundEnd.setSeconds(this.roundEnd.getSeconds() + secs);
		}
	}

	addMinutes(mins = 0) {
		if (this.paused) {
			this.minutes += this.mins;
		}
		else {
			this.addSeconds(mins * 60);
		}
	}

	addHours(hours = 0) {
		if (this.paused) {
			this.hours += hours;
		}
		else {
			this.addSeconds(hours * 60 * 60);
		}
	}

	broadcastClock() {
		nexusEvent.emit('request', 'clock', [ this.getClockState() ]);
	}
}

const clock = new GameTimer();

module.exports = clock;