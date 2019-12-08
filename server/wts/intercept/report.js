const IntercptLog = require('../../models/logs/intereptLog');
const Alert = require('../../models/logs/alert')
const interceptDebugger = require('debug')('app:intercept_report');

function interceptLogging (finalReport, attacker, defender, engaged) {
    let atkLog = {
        team: { teamName: attacker.team.teamName, teamID: attacker.team.teamId },
        location: { zone: defender.location.zone, country: defender.location.country },
        description: `${engaged} ${finalReport.attackDesc} ${finalReport.attackStatus}`,
        unit: { _id: attacker._id, description: attacker.designation,
            outcome: { 
                frameDmg: finalReport.atkDmg > 0 ? true : false,
                sysDmg: false,
                evasion: false,
                dmg: finalReport.atkDmg
            }
        },
        opponent: { _id: defender._id, description: defender.designation,
            outcome: { 
                frameDmg: finalReport.defDmg > 0 ? true : false,
                sysDmg: false,
                evasion: false,
                dmg: finalReport.defDmg
            }
        }
    };

    let defLog = {
        team: { teamName: defender.team.teamName, teamID: defender.team.teamId },
        location: { zone: defender.location.zone, country: defender.location.country },
        description: `${defender.designation} was intercepted in ${defender.location.country.countryName} airspace! ${finalReport.defenseDesc} ${finalReport.defStatus}`,
        unit: { _id: defender._id, description: defender.designation,
            outcome: { 
                frameDmg: finalReport.defDmg > 0 ? true : false,
                sysDmg: false,
                evasion: false,
                dmg: finalReport.defDmg
            }
        },
        opponent: { _id: attacker._id, description: attacker.designation,
            outcome: { 
                frameDmg: finalReport.atkDmg > 0 ? true : false,
                sysDmg: false,
                evasion: false,
                dmg: finalReport.atkDmg
            }
        }
    };

    atkLog = interceptLog(atkLog);
    defLog = interceptLog(defLog);
};

async function interceptLog (log) {
    const gameClock = require('../gameClock/gameClock')
    let { turn, phase, turnNum } = gameClock.getTimeRemaining();
    let timestamp = { timestamp: { date: Date.now(), turn, phase, turnNum } }

    let newLog = new IntercptLog({...timestamp,...log});

    let newAlert = new Alert ({
        team_id: log.team.teamID,
        teamName: log.team.teamName,
        title: 'Interception!',
        body: log.description
    });

    await newAlert.save();
    newLog = await newLog.save();

    interceptDebugger(newLog);
 };

 module.exports = interceptLogging;