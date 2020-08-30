const interceptDebugger = require('debug')('app:intercept - outcome:');

// Aggressive Interception Switch - Used for aggresive missions
function outcome (unit, roll, stance) {
    let aggresiveArray = unit.stats.activeRolls; // Results table from the aircraft
    let passiveArray = unit.stats.passiveRolls; // Results table from the aircraft
    let { name } = unit; // Destructure of unit to allow the easy use of name
    let result = {
        damage: 0, // Hull dmg done to the aircraft due to pilot error
        attack: unit.stats.attack, // Extra dmg done to opponent
        sysDmg: false, // System dmg done to aircraft due to pilot error
        hit: false, // A hit with weapons scored on the enemy craft
        evade: unit.stats.evade, // Extra evade due to pilot success
        performance: ''
    };

    // Switch for if the UNIT stance is 'aggressive' | Intercept / Escort / Patrol 
    if (stance === 'aggresive') {
        interceptDebugger(`${name} is checking for aggressive outcome...`);
        // Swich used dice roll to determine one of 5 outcomes | Crit Fail / Failure / Neutral / Success / Crit Success
        switch(stance === 'aggresive') {
            case (roll <= aggresiveArray[0]):
                interceptDebugger(`${name}'s outcome ${aggresiveArray[0]} or less - Critical Fail.`)
                result.damage = 1; // Crit fail does damage to the unit
                result.evade -= 1 // Crit Fail gives you a evade reduction chance to evade
                result.systemDmg = true; // Crit fail does damage to a units systems
                result.performance = 'Critical Fail'
                break;
            case (roll <= aggresiveArray[1]):
                interceptDebugger(`${name}'s outcome between ${aggresiveArray[0] + 1} and ${aggresiveArray[1]} - Fail.`)
                result.damage = 1; // Failure does damage to the unit
                result.systemDmg = false; // No system damage done on a fail
                result.performance = 'Fail'
                break;
            case (roll <= aggresiveArray[2]):
                interceptDebugger(`${name}'s outcome between ${aggresiveArray[1] + 1} and ${aggresiveArray[2]} - Neutral.`);
                result.hit = true; // Neutral scores a hit on the target
                result.performance = 'Neutral'
                break;
            case (roll <= aggresiveArray[3]):
                interceptDebugger(`${name}'s outcome between ${aggresiveArray[2] +1 } and ${aggresiveArray[3]} - Success.`);
                result.hit = true, // Success scores a hit on the target
                result.attack += 1
                result.performance = 'Success'
                break;
            case (roll <= aggresiveArray[4]):
                interceptDebugger(`${name}'s outcome is ${aggresiveArray[3] + 1} or more - Critical Success.`);
                result.hit = true;
                result.sysHit = true;
                result.attack += 2
                result.evade += 1 // Crit Success gives you a chance to evade
                result.performance = 'Critical Success'
                break;
            default:
                interceptDebugger(`The case does not work!`);
        }
    // Switch for if the UNIT stance is 'passive' | Recon / Transport / Diversion
    } else if (stance === 'passive') {
        interceptDebugger(`${name} is checking for passive outcome...`);
        switch(stance === 'passive') {
            case (roll <= passiveArray[0]):
                interceptDebugger(`${name}'s outcome ${passiveArray[0]} or less` - `Critical Fail.`)
                result.damage = 1;
                result.evade -= 1; // Crit Fail gives you a evade reduction chance to evade
                result.attack -= 2;
                result.systemDmg = true;
                result.performance = 'Critical Fail'
                break;
            case (roll <= passiveArray[1]):
                interceptDebugger(`${name}'s outcome between ${passiveArray[0] + 1} and ${passiveArray[1]} - Fail.`);
                result.damage = 1;
                result.attack -= 1;
                result.systemDmg = false;
                result.performance = 'Fail'
                break;
            case (roll <= passiveArray[2]):
                interceptDebugger(`${name}'s outcome between ${passiveArray[1] + 1} and ${passiveArray[2]} - Neutral.`);
                result.evade += 1;
                break;
            case (roll <= passiveArray[3]):
                interceptDebugger(`${name}'s outcome between ${passiveArray[2] + 1} and ${passiveArray[3]} - Success.`);
                result.evade += 2;
                break;
            case (roll <= passiveArray[4]):
                interceptDebugger(`${name}'s outcome between ${passiveArray[3] + 1} and ${passiveArray[4]} - Skilled success.`);
                result.evade += 2;
                result.hit = true;
                break;
            case (roll <= passiveArray[5]):
                interceptDebugger(`${name}'s outcome is ${passiveArray[4] + 1} or more - Critical success.`);
                result.evade += 3;
                result.attack += 1
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