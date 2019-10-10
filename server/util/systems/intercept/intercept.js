const atkOutcome = require('./attacker');
const defOutcome = require('./defender');
const interceptDmg = require('./damage');


// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
function intercept (attacker, defender) {
    console.log(`${attacker.designation} is attempting to engaged a ${defender.type} in ${attacker.location.country} airspace.`);
    
    let atkResult = atkOutcome(attacker); // Gets Attacker Roll
    let defResult = defOutcome(defender); // Gets Defender Roll

    report = interceptDmg(attacker, defender, atkResult, defResult);

    result = {
        attackerReport: `${attacker.designation} got a ${atkResult.outcome}`,
        defenderReport: `${defender.designation} got a ${defResult.outcome}`
    };

    const finalReport = {...report, ...result}
    console.log(result.attackerReport);
    console.log(result.defenderReport);

    return finalReport;
};

module.exports = intercept;