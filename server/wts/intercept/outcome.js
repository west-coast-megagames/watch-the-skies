const interceptDebugger = require('debug')('app:intercept - outcome:');

// Aggressive Interception Switch - Used for aggresive missions
function outcome (unit, roll, stance) {
    let aggresiveArray = unit.stats.activeRolls; // Results table from the aircraft
    let passiveArray = unit.stats.passiveRolls; // Results table from the aircraft
    let { designation } = unit; // Destructure of unit to allow the easy use of designation
    let result = {
        damage: 0, // Hull dmg done to the aircraft due to pilot error
        sysDmg: false, // System dmg done to aircraft due to pilot error
        hit: false, // A hit with weapons scored on the enemy craft
        evade: 0 // Extra evade due to pilot success
    };

    // Switch for if the UNIT stance is 'aggressive' | Intercept / Escort / Patrol 
    if (stance === 'aggresive') {
        interceptDebugger(`${designation} is checking for aggressive outcome...`);
        // Swich used dice roll to determine one of 5 outcomes | Crit Fail / Failure / Neutral / Success / Crit Success
        switch(stance === 'aggresive') {
            case (roll <= aggresiveArray[0]):
                interceptDebugger(`${designation}'s outcome ${aggresiveArray[0]} or less - catastrophic failure.`)
                result.damage = 1; // Crit fail does damage to the unit
                result.systemDmg = true; // Crit fail does damage to a units systems
                break;
            case (roll <= aggresiveArray[1]):
                interceptDebugger(`${designation}'s outcome between ${aggresiveArray[0] + 1} and ${aggresiveArray[1]} - failure.`)
                result.damage = 1; // Failure does damage to the unit
                result.systemDmg = false; // No system damage done on a fail
                break;
            case (roll <= aggresiveArray[2]):
                interceptDebugger(`${designation}'s outcome between ${aggresiveArray[1] + 1} and ${aggresiveArray[2]} - Neutral Result.`);
                result.hit = true; // Neutral scores a hit on the target
                break;
            case (roll <= aggresiveArray[3]):
                interceptDebugger(`${designation}'s outcome between ${aggresiveArray[2] +1 } and ${aggresiveArray[3]} - Mild Success.`);
                result.hit = true, // Success scores a hit on the target
                result.evade = unit.stats.evade + 1 // Success gives you a chance to evade
                break;
            case (roll <= aggresiveArray[4]):
                interceptDebugger(`${designation}'s outcome is ${aggresiveArray[3] + 1} or more - Critical Success.`);
                result.hit = true;
                result.sysHit = true;
                result.evade = unit.stats.evade + 2;
                break;
            default:
                interceptDebugger(`The case does not work!`);
        }
    // Switch for if the UNIT stance is 'passive' | Recon / Transport / Diversion
    } else if (stance === 'passive') {
        interceptDebugger(`${designation} is checking for passive outcome...`);
        switch(stance === 'passive') {
            case (roll <= passiveArray[0]):
                interceptDebugger(`${designation}'s outcome ${passiveArray[0]} or less` - `catastrophic failure.`)
                result.damage = 1;
                result.systemDmg = true;
                break;
            case (roll <= passiveArray[1]):
                interceptDebugger(`${designation}'s outcome between ${passiveArray[0] + 1} and ${passiveArray[1]} - failure.`);
                result.damage = 1;
                result.systemDmg = false;
                break;
            case (roll <= passiveArray[2]):
                interceptDebugger(`${designation}'s outcome between ${passiveArray[1] + 1} and ${passiveArray[2]} - neutral result.`);
                result.evade = unit.stats.evade + 1;
                break;
            case (roll <= passiveArray[3]):
                interceptDebugger(`${designation}'s outcome between ${passiveArray[2] + 1} and ${passiveArray[3]} - mild success.`);
                result.evade = unit.stats.evade + 2;
                break;
            case (roll <= passiveArray[4]):
                interceptDebugger(`${designation}'s outcome between ${passiveArray[3] + 1} and ${passiveArray[4]} - good success.`);
                result.evade = unit.stats.evade + 2;
                result.hit = true;
                break;
            case (roll <= passiveArray[5]):
                interceptDebugger(`${designation}'s outcome is ${passiveArray[4] + 1} or more - critical success.`);
                result.evade = unit.stats.evade + 3;
                result.hit = true;
                result.sysHit = true;
                break;
            default:
                interceptDebugger(`The case does not work!`);
        };    
    };

    return result;
};

module.exports = { outcome }