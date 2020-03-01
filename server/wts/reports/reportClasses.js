const reportDebugger = require('debug')('app:reports');
const ResearchLog = require('../../models/logs/researchLog');
const ReconLog = require('../../models/logs/reconLog');

// Function that makes a timestamp for log files
function makeTimestamp() {
    const gameClock = require('../gameClock/gameClock')
    let { turn, phase, turnNum, minutes, seconds } = gameClock.getTimeRemaining();
    let timestamp = { timestamp: { turn, phase, turnNum, clock: `${minutes}:${seconds}` }}
    return timestamp;
}

// After Action Report for Lab activity
class ResearchReport {
    constructor() {
        this.date = ''
        this.team = {}
        this.lab = {}
        this.project = {}
        this.funding = 0
        this.stats = {
            sciRate: 0,
            sciBonus: 0,
            finalMultiplyer: 0,
            breakthroughCount: 0,
            completed: false
        },
        this.progress = {
            startingProgress: 0,
            endingProgress: 0,
        },
        this.rolls = []
        this.outcomes = []
        this.saveReport = this.saveReport.bind(this);
    }

    async saveReport() {
        try {
        reportDebugger(`Saving report!`);
            let timestamp = makeTimestamp();
            this.date = Date.now();
            let submission = new ResearchLog({...timestamp,...this})

            submission = await submission.save();
            reportDebugger(submission);

            return;
        } catch (err) {
            reportDebugger(`CalcProgress Error: ${err}`);
            return
        }
    }
};

// After Action Report for Recon Missions (Ground/Air)
class ReconReport {
    constructor() {
        this.date = ''
        this.team = {}
        this.unit = {}
        this.report = {}
        this.rolls = []
        this.country = {}
        this.zone = {}

        this.saveReport = this.saveReport.bind(this);
    }

    async saveReport() {
        try {
            reportDebugger(`Saving Recon report!`);
            let timestamp = makeTimestamp();
            this.date = Date.now();
            let submission = new ReconLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return;
        } catch (err) {
            reportDebugger(`Recon Log Error: ${err}`);
            return
        }
    }
};

class TransportReport {
    constructor() {
        this.date = ''
        this.team = {}
        this.unit = {}
        this.report = {}
        this.site = {}
        this.country = {}
        this.zone = {}

        this.saveReport = this.saveReport.bind(this);
    }

    async saveReport() {
        try {
            reportDebugger(`Saving Transport report!`);
            let timestamp = makeTimestamp();
            this.date = Date.now();
            let submission = new TransportLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return;
        } catch (err) {
            reportDebugger(`Transport Log Error: ${err}`);
            return
        }
    }
};

class BattleReport {
    constructor() {
        this.team = {}
        this.attackers = []
        this.defenders = []
        this.stats = {}
        this.stats.atkTotal = 0
        this.stats.atkDamage = 0
        this.stats.defTotal = 0
        this.stats.defDamage = 0
        this.casualties = []
        this.salvage = []
        this.report = {}
        this.site = {}
        this.country = {}
        this.zone = {}

        this.saveReport = this.saveReport.bind(this);
    }

    async saveReport() {
        try {
            reportDebugger(`Saving Battle report!`);
            let timestamp = makeTimestamp();
            this.date = Date.now();
            let submission = new TransportLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return;
        } catch (err) {
            reportDebugger(`Transport Log Error: ${err}`);
            return
        }
    }
};

class CrashReport {
    constructor() {
        this.team = {}
        this.salvage = []
        this.site = {}
        this.country = {}
        this.zone = {}
        this.saveReport = this.saveReport.bind(this);
    }

    async saveReport() {
        try {
            reportDebugger(`Saving Crash report!`);
            let timestamp = makeTimestamp();
            this.date = Date.now();
            let submission = new CrashLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return;
        } catch (err) {
            reportDebugger(`Crash Log Error: ${err}`);
            return
        }
    }
}

module.exports = { ResearchReport, ReconReport, TransportReport, BattleReport, CrashReport };