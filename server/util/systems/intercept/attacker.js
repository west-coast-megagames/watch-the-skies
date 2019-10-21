const d6 = require('./dice')
const { passive, aggressive } = require('./outcome')

// Attacker Roll and outcome algorithm
function atkOutcome(unit) {    
    let roll = d6() + d6();
    let { designation, status } = unit;

    if (status.aggressive == true) {
        console.log(`${designation} attempts an aggressive intercept and rolled a ${roll}`);
        atkResult = aggressive(unit, roll);        
    } else if (status.passive == true) {
        console.log(`${designation} attempts a passive observation and rolled a ${roll}`);
        atkResult = passive(unit, roll);
    };
    return atkResult;
};

module.exports = atkOutcome;