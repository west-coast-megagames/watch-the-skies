// Test Attacker Input
let attacker =  {
    designation: "Avenger",
    type: "Interceptor",
    hull: 2,
    hullMax: 2,
    location: {
        country: "us"
    },
    status: {
        aggressive: true,
        passive: true,
        disengage: false,
        damaged: false,
        destroyed: false,
        ready: true,
        upgrade: false,
        repair: false,
        mission: true
    },
};

//Test Defender Input
let defender = {
    designation: "Man-eater",
    type: "PAC",
    hull: 3,
    hullMax: 3,
    status: {
        aggressive: false,
        passive: true,
        disengage: false,
        damaged: false,
        destroyed: false,
        ready: true,
        upgrade: false,
        repair: false,
        mission: true
    },
};

intercept(attacker, defender); // Test call of Interception Algorithm

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
function intercept (attacker, defender) {
    console.log(`${attacker.designation} is attempting to engaged a ${defender.type} in ${attacker.location.country} airspace.`);
    
    atkResult = atkOutcome (attacker);
    defResult = defOutcome (defender);

    /*if (atkResult.hit == true) {
        damageCalc(defResult.evade)
    } 
    
    atkDmg =
    defDmg = 
    */

    console.log(`${attacker.designation} got a ${atkResult.outcome}`);
    console.log(`${defender.designation} got a ${defResult.outcome}`);

};

// Attacker Roll and outcome algorithm
function atkOutcome (unit) {    
    let roll = d6() + d6();
    let { designation, status } = unit

    if (status.aggressive == true) {
        console.log(`${designation} attempts an aggressive intercept and rolled a ${roll}`);
        atkResult = aggroResult(unit, roll)        
    } else if (status.passive == true) {
        console.log(`${designation} attempts a passive observation and rolled a ${roll}`);
        atkResult = passiveResult(unit, roll)
    };
    return atkResult;
};

// Defender roll and outcome algorithm
function defOutcome (unit) {
    let roll = d6() + d6();
    let { designation, status } = unit

    if (status.aggressive == true) {
        console.log(`${designation} attempts to engage the intercepting craft and rolled a ${roll}`);
        defResult = aggroResult(unit, roll)        
    } else if (status.passive == true) {
        console.log(`${designation} attempts to complete the mission and rolled a ${roll}`);
        defResult = passiveResult(unit, roll)
    };
    return defResult;
};

// Aggressive Interception Switch
function aggroResult (unit, roll) {
    let chances = [3, 5, 8, 10, 12];
    let { designation } = unit;
    let result = {
        outcome: 'TBD',
        damage: 0,
        sysDmg: false,
        hit: false,
        sysHit: false,
        evade: 0,
        disengage: false,
    };

    console.log(`${designation} is checking for aggressive outcome...`)
    switch(unit.status.aggressive == true) {
        case (roll <= chances[0]):
            console.log(`${designation}'s outcome ${chances[0]} or less`)
            result.outcome = `catastrophic failure.`;
            result.damage = 1;
            result.systemDmg = true;
            break;
        case (roll <= chances[1]):
            console.log(`${designation}'s outcome between ${chances[0] + 1} and ${chances[1]}`)
            result.outcome = `failure.`;
            result.damage = 1;
            result.systemDmg = false;
            break;
        case (roll <= chances[2]):
            console.log(`${designation}'s outcome between ${chances[1] + 1} and ${chances[2]}`);
            result.outcome = `Neutral Result.`;
            result.disengage = disengageAttempt(unit);
            break;
        case (roll <= chances[3]):
            console.log(`${designation}'s outcome between ${chances[2] +1 } and ${chances[3]}`);
            result.outcome = `Mild Success.`;
            result.hit = true,
            result.sysHit = true,
            result.disengage = disengageAttempt(unit);
            break;
        case (roll <= chances[4]):
            console.log(`${designation}'s outcome is ${chances[3] + 1} or more`);
            result.outcome = `Critical Success.`;
            result.hit = true,
            result.sysHit = true,
            result.disengage = disengageAttempt(unit);
            break;
        default:
            console.log(`The case does not work!`);
    }
    return result;
};

// Passive Interception Switch
function passiveResult (unit, roll) {
    let chances = [2, 4, 7, 9, 11, 12];
    let { designation } = unit;
    let result = {
        outcome: 'TBD',
        damage: 0,
        sysDmg: false,
        hit: false,
        sysHit: false,
        evade: 0,
        disengage: false,
    };

    console.log(`${designation} is checking for passive outcome...`)
    switch(unit.status.passive == true) {
        case (roll <= chances[0]):
            console.log(`${designation}'s outcome ${chances[0]} or less`)
            result.outcome = `catastrophic failure.`;
            result.damage = 1;
            result.systemDmg = true;
            break;
        case (roll <= chances[1]):
            console.log(`${designation}'s outcome between ${chances[0] + 1} and ${chances[1]}`)
            result.outcome = `failure.`;
            result.damage = 1;
            result.systemDmg = false;
            break;
        case (roll <= chances[2]):
            console.log(`${designation}'s outcome between ${chances[1] + 1} and ${chances[2]}`);
            result.outcome = `neutral result.`;
            break;
        case (roll <= chances[3]):
            console.log(`${designation}'s outcome between ${chances[2] +1 } and ${chances[3]}`);
            result.outcome = `mild success.`;
            result.disengage = disengageAttempt(unit);
            break;
        case (roll <= chances[4]):
            console.log(`${designation}'s outcome between ${chances[3] + 1} and ${chances[4]}`);
            result.outcome = `good success.`;
            result.evade = 1;
            result.disengage = disengageAttempt(unit);
            break;
        case (roll <= chances[5]):
            console.log(`${designation}'s outcome is ${chances[4] + 1} or more`);
            result.outcome = `critical success.`;
            result.evade = 2;
            result.disengage = disengageAttempt(unit);
            break;
        default:
            console.log(`The case does not work!`);
    }
    return result;
};

function disengageAttempt (unit) {
    let { designation } = unit;
    console.log(`${designation} attempted to bug-out.`)
    return false;
};

// Random d6 die roll
function d6 () {
    let rand = 1 + Math.floor(Math.random() * 6);
    return rand;
};

// Fake interception algorithm to test DB input to intercept system
function interceptTest (attacker, defender, atkStatus) {
    // console.log(attacker)
    console.log(`${attacker.designation} confirmed as attacker!`)
    console.log(`${defender.designation} confirmed as defender!`)
    console.log(`${attacker.designation} is on an ${atkStatus} mission...`)
};

module.exports = interceptTest;