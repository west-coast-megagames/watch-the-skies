const interceptDebugger = require('debug')('app:intercept');

// Aggressive Interception Switch - Used for aggresive missions
function outcome (unit, roll, stance) {
    let aggresive = unit.stats.activeRolls; // Results table from the aircraft
    let passive = unit.stats.passiveRolls; // Results table from the aircraft
    let { designation } = unit;
    let result = {
        damage: 0, // Hull dmg done to the aircraft due to pilot error
        sysDmg: false, // System dmg done to aircraft due to pilot error
        hit: false, // A hit with weapons scored on the enemy craft
        evade: 0 // Extra evade due to pilot success
    };

    switch(stance === 'aggressive') {
        case (true):
            interceptDebugger(`${designation} is checking for aggressive outcome...`);
        case (roll <= chances[0]):
            interceptDebugger(`${designation}'s outcome ${chances[0]} or less - catastrophic failure.`)
            result.damage = 1;
            result.systemDmg = true;
            break;
        case (roll <= chances[1]):
            interceptDebugger(`${designation}'s outcome between ${chances[0] + 1} and ${chances[1]} - failure.`)
            result.damage = 1;
            result.systemDmg = false;
            break;
        case (roll <= chances[2]):
            interceptDebugger(`${designation}'s outcome between ${chances[1] + 1} and ${chances[2]} - Neutral Result.`);
            break;
        case (roll <= chances[3]):
            interceptDebugger(`${designation}'s outcome between ${chances[2] +1 } and ${chances[3]} - Mild Success.`);
            result.hit = true,
            result.evade += 1
            break;
        case (roll <= chances[4]):
            interceptDebugger(`${designation}'s outcome is ${chances[3] + 1} or more - Critical Success.`);
            result.hit = true;
            result.sysHit = true;
            result.evade += 2;
            break;
        default:
            interceptDebugger(`The case does not work!`);
    };

    switch(stance === 'passive') {
        case (true):
            interceptDebugger(`${designation} is checking for passive outcome...`)
        case (roll <= chances[0]):
            interceptDebugger(`${designation}'s outcome ${chances[0]} or less` - `catastrophic failure.`)
            result.damage = 1;
            result.systemDmg = true;
            break;
        case (roll <= chances[1]):
            interceptDebugger(`${designation}'s outcome between ${chances[0] + 1} and ${chances[1]} - failure.`);
            result.damage = 1;
            result.systemDmg = false;
            break;
        case (roll <= chances[2]):
            interceptDebugger(`${designation}'s outcome between ${chances[1] + 1} and ${chances[2]} - neutral result.`);
            break;
        case (roll <= chances[3]):
            interceptDebugger(`${designation}'s outcome between ${chances[2] +1 } and ${chances[3]} - mild success.`);
            result.evade += 1;
            break;
        case (roll <= chances[4]):
            interceptDebugger(`${designation}'s outcome between ${chances[3] + 1} and ${chances[4]} - good success.`);
            result.evade += 2;
            break;
        case (roll <= chances[5]):
            interceptDebugger(`${designation}'s outcome is ${chances[4] + 1} or more - critical success.`);
            result.evade += 2;
            result.hit = true;
            break;
        default:
            interceptDebugger(`The case does not work!`);
    };
    return result;
};

function disengageAttempt (unit) {
    let { designation } = unit;
    interceptDebugger(`${designation} attempted to bug-out.`)
    return false;
};

module.exports = { outcome }