const { atkRoll, defRoll } = require('./rolls');
const interceptDmg = require('./damage');

const IntercptLog = require('../../../models/logs/log');

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
function intercept (attacker, defender) {
    let engaged = `${attacker.designation} is attempting to engaged a ${defender.type} in ${attacker.location.country} airspace.`;
    console.log(engaged);
    
    let atkResult = atkRoll(attacker); // Gets Attacker Roll
    let defResult = defRoll(defender); // Gets Defender Roll

    report = interceptDmg(attacker, defender, atkResult, defResult);

    result = {
        attackerReport: `${attacker.designation} got a ${atkResult.outcome}`,
        defenderReport: `${defender.designation} got a ${defResult.outcome}`
    };
    
    const finalReport = {...report, ...result}

   let atkLog = new IntercptLog({
       logType: 'Interception',
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
               frameDmg: finalReport.atkDmg,
               sysDmg: false,
               evasion: false,
               dmg: finalReport.atkDmg
           }
        },
        opponent: {
            _id: defender._id,
            description: defender.designation,
            outcome: { 
                frameDmg: finalReport.defDmg,
                sysDmg: false,
                evasion: false,
                dmg: finalReport.defDmg
            }
        }
    });

    atkLog.save();

    console.log(atkLog);
    console.log(result.defenderReport);

    return atkLog;
};

module.exports = intercept;