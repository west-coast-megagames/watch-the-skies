const IntercptLog = require('../../../models/logs/log');
const alert = require('../notifications/alerts');

function atkLog(finalReport, attacker, defender, engaged) {
const gameClock = require('../gameClock/gameClock')
let { turn, phase, turnNum } = gameClock.getTimeRemaining();

let atkLog = new IntercptLog({
    timestamp: {
        date: Date.now(),
        turn,
        phase,
        turnNum
    },
    team: {
        teamName: attacker.team.teamName,
        teamID: attacker.team.teamId
    },
    location: {
        zone: attacker.location.zone,
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

    let newAlert = {
        team: attacker.team.teamName,
        title: 'Interception!',
        body: atkLog.description
    }

    alert.setAlert(newAlert);
    
    
    atkLog.save();

     return atkLog;
 }

 module.exports = atkLog;