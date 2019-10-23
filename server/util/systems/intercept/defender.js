const { d6 } = require('./dice')
const { passive, aggressive } = require('./outcome')

// Defender roll and outcome algorithm
function defOutcome(unit) {
    let roll = d6() + d6();
    let { designation, status } = unit

    if (status.aggressive == true) {
        console.log(`${designation} attempts to engage the intercepting craft and rolled a ${roll}`);
        defResult = aggressive(unit, roll)        
    } else if (status.passive == true) {
        console.log(`${designation} attempts to complete the mission and rolled a ${roll}`);
        defResult = passive(unit, roll)
    };
    return defResult;
};

module.exports = defOutcome;