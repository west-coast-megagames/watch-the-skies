const IntercptLog = require('../../../models/logs/log');

 function atkLog(finalReport, attacker, defender, engaged) {
    const gameClock = require('../gameClock/gameClock')
    let { turn, phase } = gameClock();
    
    let atkLog = new IntercptLog({
        logType: 'Interception',
        timestamp: {
            date: Date.now(),
            turn,
            phase
        },
        teamID: attacker.team,
        location: {
            zone: 'Test',
            country: attacker.location.country
        },
        description: `${engaged} ${finalReport.attackDesc} ${finalReport.attackStatus}`,
        unit: {
            _id: attacker._id,
            description: attacker.designation,
            outcome: { 
                frameDmg: finalReport.atkDmg > 0 ? true : false,
                sysDmg: false,
                evasion: false,
                dmg: finalReport.atkDmg
            }
         },
         opponent: {
             _id: defender._id,
             description: defender.designation,
             outcome: { 
                 frameDmg: finalReport.defDmg > 0 ? true : false,
                 sysDmg: false,
                 evasion: false,
                 dmg: finalReport.defDmg
             }
         }
     });
    
     atkLog.save();

     return atkLog;
 }

 module.exports = atkLog;