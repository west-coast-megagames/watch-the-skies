const reportDebugger = require('debug')('app:reports');
const ResearchLog = require('../../models/logs/researchLog');
const ReconLog = require('../../models/logs/reconLog');
const DeployLog = require('../../models/logs/deployLog');
const CrashLog = require('../../models/logs/crashLog');
const TheoryLog = require('../../models/logs/theoryLog');
const TradeLog = require('../../models/logs/tradeLog');
const RepairLog = require('../../models/logs/repairLog');
const { TerrorLog } = require('../../models/logs/log');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
const Gameclock = require('../gameClock/gameClock')

function createServiceRecord() {
    return
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
            let timestamp = Gameclock.makeTimestamp();
            this.date = Date.now();
            let submission = new ResearchLog({...timestamp,...this})

            submission = await submission.save();
            reportDebugger(submission);

            return submission;
        } catch (err) {
            reportDebugger(`Reserch Report Error: ${err}`);
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
            let timestamp = Gameclock.makeTimestamp();
            this.date = Date.now();
            let submission = new ReconLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return submission
        } catch (err) {
            reportDebugger(`Recon Report Error: ${err}`);
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
            let timestamp = Gameclock.makeTimestamp();
            this.date = Date.now();
            let submission = new TransportLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return submission
        } catch (err) {
            reportDebugger(`Transport Report Error: ${err}`);
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
            let timestamp = Gameclock.makeTimestamp();
            this.date = Date.now();
            let submission = new TransportLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return submission
        } catch (err) {
            reportDebugger(`Transport Report Error: ${err}`);
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
            let timestamp = Gameclock.makeTimestamp();
            this.date = Date.now();
            let submission = new CrashLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return submission
        } catch (err) {
            reportDebugger(`Crash Report Error: ${err}`);
            return
        }
    }
}

class DeploymentReport {
    constructor() {
        this.team = {}
        this.units = []
        this.site = {}
        this.country = {}
        this.zone = {}
        this.cost = 0,
        this.saveReport = this.saveReport.bind(this);
    }

    async saveReport() {
        try {
            reportDebugger(`Saving Deployment report!`);
            let timestamp = Gameclock.makeTimestamp();
            this.date = Date.now();
            let submission = new DeployLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return submission
        } catch (err) {
            reportDebugger(`Deployment Report Error: ${err}`);
            return
        }
    }
}

class TheoryReport {
    constructor() {
        this.team = {}
        this.project = {},
        this.saveReport = this.saveReport.bind(this);
    }

    async saveReport() {
        try {
            reportDebugger(`Saving Theory report!`);
            let timestamp = Gameclock.makeTimestamp();
            this.date = Date.now();
            let submission = new TheoryLog({...timestamp,...this});

            submission = await submission.save();
            reportDebugger(submission);

            return submission
        } catch (err) {
            reportDebugger(`Theory Report Error: ${err}`);
            return
        }
    }
}

class TerrorReport {
  constructor() {
    this.date = ''
    this.team = {}
    this.country = {}
    this.zone = {}
    this.startTerror = 0
    this.addTerror = 0
    this.endTerror = 0
    this.terrorMessage = {}
    this.saveReport = this.saveReport.bind(this);
  }
   
  async saveReport() {
    try {
      reportDebugger(`Saving Terror report!`);
      let timestamp = makeTimestamp();
      this.date = Date.now();
      let submission = new TerrorLog({...timestamp,...this})
      submission = await submission.save();
      reportDebugger(submission);
  
      return submission
    } catch (err) {
      reportDebugger(`Terror Report Error: ${err}`);
      logger.error(`Terror Report Error${err}`, {meta: err});  
      return
    }
  }
}

class TradeReport {
    constructor() {
        this.team = ''
        this.date = ''
        this.trade = {}
        this.saveReport = this.saveReport.bind(this);
    }

    async saveReport(team, trade) {
        try {
            reportDebugger(`Saving Trade Report!`);

            this.team = team;
            this.trade = trade;
            let timestamp = Gameclock.makeTimestamp();
            this.date = Date.now();
            let submission = new TradeLog({...timestamp,...this})
            submission = await submission.save();
            reportDebugger(submission);

            return submission
        } catch (err) {
            reportDebugger(`Trade Report Error: ${err}`);
            logger.error(`Trade Report Error: ${err}`, {meta: err});
            return;
        }
    }
}

class RepairReport {
    constructor() {
        this.team = ''
        this.date = ''
        this.logType = ''
        this.dmgRepaired = 0
        this.cost = 0
        this.saveReport = this.saveReport.bind(this);
    }

    async saveReport() {
        try {
            reportDebugger(`Saving Repair Report!`);
            let timestamp = Gameclock.makeTimestamp();
            this.date = Date.now();
            let submission = new RepairLog({...timestamp,...this})
            submission = await submission.save();
            reportDebugger(submission);

            return submission
        } catch (err) {
            reportDebugger(`Repair Report Error: ${err}`);
            logger.error(`Repair Report Error: ${err}`, {meta: err});
            return;
        }
    }
}



module.exports = { BattleReport, CrashReport, ResearchReport, ReconReport, RepairReport, TransportReport, DeploymentReport, TheoryReport, TerrorReport, TradeReport };