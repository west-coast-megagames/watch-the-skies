const reportDebugger = require('debug')('app:reports');
const ResearchLog = require('../../models/logs/researchLog');

function makeTimestamp() {
    const gameClock = require('../gameClock/gameClock')
    let { turn, phase, turnNum, minutes, seconds } = gameClock.getTimeRemaining();
    let timestamp = { timestamp: { turn, phase, turnNum, clock: `${minutes}:${seconds}` }}
    return timestamp;
}

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

module.exports = { ResearchReport };