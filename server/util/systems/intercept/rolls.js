const { d6 } = require('./dice')
const { passive, aggressive } = require('./outcome')
const interceptDebugger = require('debug')('app:intercept');

// Attacker Roll and outcome algorithm
function atkRoll(unit) {    
    let roll = d6() + d6();
    let { designation, status } = unit;

    if (status.aggressive == true) {
        interceptDebugger(`${designation} attempts an aggressive intercept and rolled a ${roll}`);
        atkResult = aggressive(unit, roll);        
    } else if (status.passive == true) {
        interceptDebugger(`${designation} attempts a passive observation and rolled a ${roll}`);
        atkResult = passive(unit, roll);
    };
    return atkResult;
};


// Defender roll and outcome algorithm
function defRoll(unit) {
    let roll = d6() + d6();
    let { designation, status } = unit

    if (status.aggressive == true) {
        interceptDebugger(`${designation} engages the intercepting craft and rolled a ${roll}`);
        defResult = aggressive(unit, roll)        
    } else if (status.passive == true) {
        interceptDebugger(`${designation} attempts to complete the mission and rolled a ${roll}`);
        defResult = passive(unit, roll)
    };
    return defResult;
};

module.exports = { atkRoll, defRoll };