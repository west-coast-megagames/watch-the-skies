const IntercptLog = require('../../models/logs/intereptLog');

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

    /*sendAlert ({
        teamID: attacker.team.teamId,
        team: attacker.team.teamName,
        title: 'Interception!',
        body: atkLog.description
    });*/
    
    atkLog.save();

     return atkLog;
 }

 function sendAlert (teamID, team, title, body) {
    const alert = require('../notifications/alerts');

    alert.setAlert({ teamID, team, title, body });
 }

 module.exports = atkLog;