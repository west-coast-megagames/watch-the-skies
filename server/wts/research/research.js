const researchDebugger = require('debug')('app:research');

const Research = require('../../models/sci/research') // Imports the Research object which is the base Model for Technology, Knowledge and Analysis
const { d6 } = require('../../util/systems/dice'); // Import of the dice randomizer found in `dice.js`

const techCost = [ 66, 133, 200, 250, 300, 350 ] // Arbitratily set at increments of 50 currently
const fundingCost = [ 4, 9, 15, 22 ] // A cost of 3 + funding level per roll currently

// FUNCTION for calculating the progress applied to a single RESEARCH project
async function calculateProgress(research_id, lab_id, funding) {
    try {
        console.log(lab_id); // Future await request to get lab information from DB
        let tech = await Research.findById(research_id).populate('team', 'name sciRate shortName'); // Imports the specific Research object by _id

        console.log(tech);
        let progress = researchMultiplyer(tech.team.sciRate, 3, 0.25); // Calculates progress by getting the teams sciRate, the funding level, and any relevant multiplery bonus

        tech.status.progress += progress; // Adds progress to the current Research

        tech.status.progress > techCost[tech.level] ? tech.status.completed = true : null; // Checks for compleation of current research

        tech.status.completed === true ? researchDebugger(`${tech.name} completed!`) : researchDebugger(`${progress} progress towards ${tech.name}...`) // HOOK for the progress report...

        tech = await tech.save(); // Saves the current project to the database

        return tech;

    } catch (err) {
        console.log(err);

        return err;
    }
};

// Calculates the multiplier for the current research project and returns the progress
function researchMultiplyer(sciRate, funding, sciBonus) {
    let multiplyer = 1 + sciBonus; // Gives the base multiplier calculated as 1 + any sciBonus the team or lab have

    // For loop that rolls a d6 per funding level, and either adds or subtracts from the base multiplier
    for (let rolls = 0; rolls < funding; rolls++) {
        let roll = d6(); // Roll of a d6

        researchDebugger(roll);

        // Switch for assigning the outcome of the multiplier roll.
        switch (true) {
            case (roll <= 1):
                researchDebugger('Set Back');
                multiplyer -= 0.5 // Reduction of the multiplier due to a set-back in the research
                break;
            case (roll <= 3):
                researchDebugger('Progress');
                multiplyer += 0.25 // Progress, an increase speed of 25% | TODO, make each level variable rather then hard coded
                break;
            case (roll <= 5):
                researchDebugger('Fast Progress');
                multiplyer += 0.6 // Fast Progress, an increase speed of 60% | TODO, make each level variable rather then hard coded
                break;
            case (roll === 6):
                researchDebugger('Breakthrough');
                multiplyer += 0.2 // Breakthrough, an increase speed of 20% | TODO, make each level variable rather then hard coded
                // HOOK: Give full sciRate progress to a randomly rolled research project based on the current project. Could end up being this project or an unrelated one.
                break;
            default:
                researchDebugger('Got to default...'); // This should never happen, if it does we have a coding error....
        }
    };


    researchDebugger(`Research Multiplyer: ${multiplyer}`);
    let progress = sciRate * multiplyer // Final calculation of progress on the technology
    researchDebugger(`Progress: ${progress}...`)
    return progress; // Returns progress to the Calculate Progress function.
}

module.exports = { calculateProgress, techCost, fundingCost };