const disengageAttempt = require('./disengage')

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

module.exports = {
    aggressive: aggroResult,
    passive: passiveResult
}