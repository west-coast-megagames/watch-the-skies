const { atkRoll, defRoll } = require('./rolls');
const interceptDmg = require('./damage');
const atkLog = require('./report')

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
function intercept (attacker, defender) {
    let engaged = `${attacker.designation} is attempting to engaged a ${defender.type} in ${attacker.location.country} airspace.`;
    
    let atkResult = atkRoll(attacker); // Gets Attacker Roll
    let defResult = defRoll(defender); // Gets Defender Roll

    report = interceptDmg(attacker, defender, atkResult, defResult);

    result = {
        attackerReport: `${attacker.designation} got a ${atkResult.outcome}`,
        defenderReport: `${defender.designation} got a ${defResult.outcome}`
    };
    
    const finalReport = {...report, ...result}

    let log = atkLog(finalReport, attacker, defender, engaged);

    console.log(log);
    console.log(result.defenderReport);

    return log;
};

module.exports = intercept;