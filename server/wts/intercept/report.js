const IntercptLog = require('../../models/logs/intereptLog');
const { Aircraft } = require('../../models/ops/aircraft');
const Alert = require('../../models/logs/alert')
const interceptDebugger = require('debug')('app:intercept_report');

function interceptLogging (finalReport, attacker, defender) {
    let atkLog = {
        team: attacker.team,
        position: 'Offense',
        country: defender.country,
        zone: defender.zone,
        site: defender.site,
        report: finalReport.atkReport,
        unit: attacker._id,
        opponent: defender._id,
        atkStats: {
            damage: {
                frameDmg: finalReport.atkDmg,
                systemDmg: finalReport.atkSysDmg   
            },
            outcome: finalReport.atkStatus
        },
        defStats: {
            damage: {
                frameDmg: finalReport.defDmg,
                systemDmg: finalReport.defSysDmg   
            },
            outcome: finalReport.defStatus
        },
        salvage: finalReport.salvage
    };

    let defLog = {
        team: defender.team,
        position: 'Defense',
        country: defender.country,
        zone: defender.zone,
        site: defender.site,
        report: finalReport.defReport,
        unit: defender._id,
        opponent: attacker._id,
        atkStats: {
            damage: {
                frameDmg: finalReport.atkDmg,
                systemDmg: finalReport.atkSysDmg   
            },
            outcome: finalReport.atkStatus
        },
        defStats: {
            damage: {
                frameDmg: finalReport.defDmg,
                systemDmg: finalReport.defSysDmg   
            },
            outcome: finalReport.defStatus
        },
        salvage: finalReport.salvage
    };
        
    atkLog = makeAfterActionReport(atkLog);
    defLog = makeAfterActionReport(defLog);
};

async function makeAfterActionReport(log) {
    const gameClock = require('../gameClock/gameClock')
    let { turn, phase, turnNum, minutes, seconds } = gameClock.getTimeRemaining();
    let timestamp = { timestamp: { turn, phase, turnNum, clock: `${minutes}:${seconds}` } }
    let date = Date.now()
    let newLog = new IntercptLog({date,...timestamp,...log});

    newLog = await newLog.save();
    
    // Saves the log in the aircrafts survice record...
    let aircraft = await Aircraft.findById(newLog.unit)
    aircraft.serviceRecord.push(newLog._id);

    await aircraft.save();

    interceptDebugger(newLog);
 };

 module.exports = { interceptLogging, makeAfterActionReport };