const test = require('./test')
const atkOutcome = require('./attacker')
const defOutcome = require('./defender')

// intercept(test.attacker, test.defender); // Test call of Interception Algorithm

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
function intercept (attacker, defender) {
    console.log(`${attacker.designation} is attempting to engaged a ${defender.type} in ${attacker.location.country} airspace.`);
    
    atkResult = atkOutcome(attacker);
    defResult = defOutcome(defender);

    /*if (atkResult.hit == true) {
        damageCalc(defResult.evade)
    } 
    
    atkDmg =
    defDmg = 
    */

    console.log(`${attacker.designation} got a ${atkResult.outcome}`);
    console.log(`${defender.designation} got a ${defResult.outcome}`);
    result = {
        attackerReport: `${attacker.designation} got a ${atkResult.outcome}`,
        defenderReport: `${defender.designation} got a ${defResult.outcome}`,
    };

    return result;
};

// Fake interception algorithm to test DB input to intercept system
function interceptTest (attacker, defender) {
    // console.log(attacker)
    let atkStatus = "testing"
    console.log(`${attacker.designation} confirmed as attacker!`)
    console.log(`${defender.designation} confirmed as defender!`)
    console.log(`${attacker.designation} is on an ${atkStatus} mission...`)
};

module.exports = intercept;