const researchDebugger = require('debug')('app:research');
const nexusEvent = require('../../startup/events');
const { logger } = require('../../middleware/winston');

const { Research } = require('../../models/sci/research') // Imports the Research object which is the base Model for Technology, Knowledge and Analysis
const { d6 } = require('../../util/systems/dice'); // Import of the dice randomizer found in `dice.js`

const { techCost, fundingCost, multiplier } = require('./sciState')

const { Facility } = require('../../models/gov/facility/facility');
const { Team } = require('../../models/team/team');
const { ResearchReport } = require('../reports/reportClasses');
const { techTree } = require('./techTree');
const { knowledgeTree } = require('./knowledge'); 

async function startResearch () {
    researchDebugger('Research system triggered...')
    let placeholder = await Research.findOne({name: "Empty Lab"})
    
    try {
        for await (let facility of await Facility.find({ 'capability.research.active': true })) {
            let research = facility.capability.research;

            for (let i = 0; i < research.capacity; i++) {
                let lab = {
                    _id: facility._id,
                    team: facility.team,
                    name: `${facility.name} - 0${i+1}`,
                    index: i,
                    project: research.projects[i],
                    funding: research.funding[i],
                    sciRate: research.sciRate,
                    sciBonus: research.sciBonus,
                    status: {
                        pending: research.status.pending[i]
                    }
                }

                if (lab.project.toHexString() === placeholder._id.toHexString()) {
                    researchDebugger(`${lab.name} labs have no research to conduct...`);
                    let projects = await Research.find({team: facility.team, 'status.completed': false, type: 'Technology'});
                    let rand = Math.floor(Math.random() * (projects.length - 1));
        
                    if (projects.length > 0) {
                        let project = projects[rand];
                        researchDebugger(`${facility.name} labs have independently choosen to work on ${project.name}...`);
                        lab.project = project._id;
                        lab.funding = 0;
                        await conductResearch(lab);
                    }
                } else {
                    researchDebugger(`${lab.name} has research to conduct`);
                    await conductResearch(lab);
                }
            }
        }
        nexusEvent.emit('updateResearch');
        nexusEvent.emit('updateFacilities');
    } catch (err) {
        logger.error(`Research System Error: ${err.message}`, {meta: err,})
    }
}

// FUNCTION for calculating the progress applied to a single RESEARCH project
async function conductResearch(lab) {
    researchDebugger(`${lab.name} has begun conducting research.`)
    let report = new ResearchReport

    try {
        let tech = await Research.findById(lab.project).populate('team'); // Imports the specific Research object by _id
        if (tech != null) {
            researchDebugger(`Current Progress: ${tech.progress}`)
            report.progress.startingProgress = tech.progress; // Tracks progress in the Research Report
            // researchDebugger(tech)
            let team = await Team.findById(lab.team); // Finds the owner of the Lab
            report.project = tech._id; // Records the research being worked on
            report.lab = lab._id; // Records the lab working on the project
            researchDebugger(`Team Sci Rate: ${team.sciRate} - type: ${typeof team.sciRate}`);
            researchDebugger(`Lab Sci Rate: ${lab.sciRate} - type: ${typeof lab.sciRate}`);
            let sciRate = team.sciRate + lab.sciRate
            let sciBonus = lab.sciBonus
            researchDebugger(`Science Rate: ${sciRate}`)
            let progressInfo = await calculateProgress(sciRate, lab.funding, sciBonus); // Calculates progress by getting the teams sciRate, the funding level, and any relevant multiplery bonus

            if (tech.type === 'Knowledge') {
                tech.progress += progressInfo.progress; // Adds progress to the current Knowledge
                let index = tech.teamProgress.findIndex(el => el.team.name === team.name);
                tech.teamProgress[index].progress += progressInfo.progress;
            } else {
                tech.progress += progressInfo.progress; // Adds progress to the current Research
            }

            tech.progress >= techCost[tech.level] && tech.type !== 'Knowledge' ? tech.status.completed = true 
                : tech.progress >= techCost[tech.level] && tech.type === 'Knowledge' ? tech.status.pending = true 
                    : null; // Checks for compleation of current research

            let facility = await Facility.findById(lab._id);
            facility.capability.research.funding.set(lab.index, 0);
            facility.capability.research.status.pending.set(lab.index, false);

            if (tech.status.completed === true) {
                researchDebugger(`${tech.name} completed!`)
                let placeholder = await Research.findOne({name: 'Empty Lab'});
                facility.capability.research.projects.set(lab.index, placeholder._id);
                
                tech = await completeResearch(tech);
            } else {
                researchDebugger(`${tech.progress} progress towards ${tech.name}...`);
            }

            report.team = team._id;
            report.lab = lab._id;
            report.project = tech._id;
            report.funding = lab.funding;
            report.progress.endingProgress = tech.progress;
            report.stats.sciRate = sciRate;
            report.stats.sciBonus = sciBonus;
            report.stats.completed = tech.status.completed;
            report.stats.finalMultiplyer = progressInfo.finalMultiplier
            report.rolls = progressInfo.rolls
            report.outcomes = progressInfo.outcomes
            report.stats.breakthroughCount = progressInfo.breakthroughs
            report.date = Date.now();
            report = await report.saveReport();

            tech.researchHistory.push(report._id);
            facility.serviceRecord.push(report._id);
            await facility.save();
            tech = await tech.save(); // Saves the current project to the database
            researchDebugger(tech);

            tech.type !== 'Knowledge' ? await advanceKnowledge(tech, lab) : null;

            if (progressInfo.breakthroughs > 0) {
                await produceBreakthrough(tech, lab, progressInfo.breakthroughs);
            }
            return;
        }
    } catch (err) {
        logger.error(err)
        researchDebugger(`Research Error: ${err.message}`, { meta: err });
        return;
    }
};

// Calculates the multiplier for the current research project and returns the progress
function calculateProgress(sciRate, funding, sciBonus) {
    let finalMultiplier = 1 + sciBonus; // Gives the base multiplier calculated as 1 + any sciBonus the team or lab have
    let rolls = [];
    let outcomes = [];
    let breakthroughs = 0;
    // For loop that rolls a d6 per funding level, and either adds or subtracts from the base multiplier
    for (let i = 0; i < funding + 1; i++) {
        let roll = d6(); // Roll of a d6
        rolls.push(roll);

        researchDebugger(roll);

        // Switch for assigning the outcome of the multiplier roll.
        switch (true) {
            case (roll <= 1):
                researchDebugger('Set Back');
                finalMultiplier -= multiplier.setBack // Reduction of the progress multiplier due to a set-back in the research
                outcomes.push('Setback')
                break;
            case (roll <= 3):
                researchDebugger('Progress');
                finalMultiplier += multiplier.normal // Progress multiplier added to the final multiplier
                outcomes.push('Progress');
                break;
            case (roll <= 5):
                researchDebugger('Fast Progress');
                finalMultiplier += multiplier.fast // Fast progress multiplier added to the final multiplier
                outcomes.push('Development');
                break;
            case (roll === 6):
                researchDebugger('Breakthrough');
                finalMultiplier += multiplier.breakthrough // Breakthrough progress multiplier added to the final multiplier
                outcomes.push('Breakthrough');
                breakthroughs += 1;
                break;
            default:
                researchDebugger('Got to default...'); // This should never happen, if it does we have a coding error....
        }
    };

    researchDebugger(`Research finalMultiplier: ${finalMultiplier}`);
    let progress = Math.floor(sciRate * finalMultiplier) // Final calculation of progress on the technology
    researchDebugger(`Progress: ${progress}...`);
    return { progress, finalMultiplier, rolls, outcomes, breakthroughs } // Returns progress to the Calculate Progress function.
};

// FUNCTION for finalizing a completed tech
async function completeResearch(research) {
    researchDebugger(`Enough progress has been made to complete ${research.name}...`);
    research.status.available = false;
    research.status.completed = true;

    if (research.type === 'Knowledge') {
        if (research.level < 5) {
            research.status.pending = false;
            let nextKnowledge = knowledgeTree.find(el => el.field === research.field && el.level === research.level + 1);
            await nextKnowledge.unlock();
            researchDebugger(`UNLOCKING: ${research.type} - ${nextKnowledge.name}`);
            console.log(nextKnowledge);
        };
    }

    if (research.type === 'Technology') {
        for await (let item of research.unlocks) {
            if (item.type === 'Technology') {
                let team = await Team.findById({_id: research.team._id});
                let newTech = techTree.find(el => el.code === item.code);
                researchDebugger(`New Theory: ${item.type} - ${newTech.name}`);
                await newTech.unlock(team); //changed 'lab' to 'team'
            }
        }
    }

    research = await research.save();
  
    return research;
};

async function advanceKnowledge(research, lab) {
    for (let knowledge of research.knowledge) {
        let project = await Research.findOne({
            type: 'Knowledge',
            field: knowledge.field,
            'status.available': true,
            'status.completed': false
        })
        lab.project = project._id;
        lab.funding = knowledge.rolls;
        researchDebugger(`Progressing Human Knowledge: ${project.type} - ${project.name}`);
        await conductResearch(lab);
    }
    return
}

async function produceBreakthrough(research, lab, count) {
    let options = [...research.breakthrough, ...research.unlocks];
    let team = await Team.findById(lab.team);
    for (let i = 0; i < count; i++) {
        let breakthrough = false;
        for (let tech of options) {
            if (tech.type === 'Technology') {
                tech = techTree.find(el => el.code === tech.code);
                researchDebugger(`Possible Breakthrough: ${tech.type} - ${tech.name}`);
                breakthrough = await tech.unlock(team);
                if (breakthrough !== false) {
                    lab.project = breakthrough._id;
                    lab.funding = 0;
                    researchDebugger(`Researching Breakthrough: ${tech.type} - ${tech.name}`);
                    await conductResearch(lab);
                    break;
                }
            }
        }   
    }
    return;
}

// Assigns credit for all pending knowledge fields
async function assignKnowledgeCredit() {
    try {
        let research = await Research.find({'status.pending': true, type: 'Knowledge'}); //Gets all pending knowledge from the DB
        researchDebugger(`${research.length} research to give credit for!`);

        // For loop that looks through each field that is pending
        for (let field of research) {
            let credit = undefined; // Temp assignment of who gets credit for this research
            let creditName = undefined;
            let highProgress = 0 // Current highest progress

            // For loop that looks through each teams progress towards the knowledge field
            for (let country of field.teamProgress) {
                if (country.progress > highProgress) {
                    highProgress = country.progress; // Assigns the current progress to highProgress if the team has more
                    credit = country.team._id; // Assigns the current country to credit if the team has more
                    creditName = country.team.name;
                }
            }

            researchDebugger(`${creditName} has been credited with advancing ${field.name}`);            
            field.credit = credit; // Gives credit to whatever team has the most at the end of the loop
            let knowledge = await field.save()
            await completeResearch(knowledge);
        }
        
        researchDebugger('Giving credit for research completed!')
    } catch (err) {
        logger.error(`Knowledge Credit Error: ${err.message}`, {meta: err})
    }
}

module.exports = { startResearch, conductResearch, assignKnowledgeCredit, techCost, fundingCost };