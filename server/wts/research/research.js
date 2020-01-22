const researchDebugger = require('debug')('app:research');

const Research = require('../../models/sci/research')
const { d6 } = require('../../util/systems/dice')

const techCost = [ 50, 100, 150, 200, 250, 300 ]

async function calculateProgress(research_id, lab_id, funding) {
    try {
        console.log(lab_id); // Future await request to get lab information from DB
        let tech = await Research.findById(research_id).populate('team', 'name sciRate shortName');

        console.log(tech);
        let progress = researchMultiplyer(tech.team.sciRate, 3, 0.25);

        tech.status.progress += progress;

        tech.status.progress > techCost[tech.level] ? tech.status.completed = true : null;

        tech.status.completed === true ? researchDebugger(`${tech.name} completed!`) : researchDebugger(`${progress} progress towards ${tech.name}...`)

        tech = await tech.save();

        return tech;

    } catch (err) {
        console.log(err);

        return err;
    }
};

function researchMultiplyer(sciRate, funding, sciBonus) {
    let multiplyer = 1 + sciBonus;

    for (let rolls = 0; rolls < funding; rolls++) {
        let roll = d6();

        researchDebugger(roll);

        switch (true) {
            case (roll <= 1):
                researchDebugger('Lab accident!');
                multiplyer -= 0.5
                break;
            case (roll <= 3):
                researchDebugger('Progress');
                multiplyer += 0.25
                break;
            case (roll <= 5):
                researchDebugger('Fast Progress');
                multiplyer += 0.6
                break;
            case (roll === 6):
                researchDebugger('Breakthrough');
                multiplyer += 0.2
                break;
            default:
                researchDebugger('Got to default...');
        }
    };


    researchDebugger(`Research Multiplyer: ${multiplyer}`);
    let progress = sciRate * multiplyer
    researchDebugger(`Progress: ${progress}...`)
    return progress;
}

module.exports = { calculateProgress, techCost };