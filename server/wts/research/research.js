const researchDebugger = require('debug')('app:research');
const nexusEvent = require('../../middleware/events/events');
const { logger } = require('../../middleware/log/winston');

const { Research } = require('../../models/research'); // Imports the Research object which is the base Model for Technology, Knowledge and Analysis
const { d6 } = require('../../util/systems/dice'); // Import of the dice randomizer found in `dice.js`

const { techCost, fundingCost, multiplier } = require('./sciState');

const { Facility } = require('../../models/facility');
const { Team } = require('../../models/team');
const { ResearchReport } = require('../../models/report');
const { techTree } = require('./techTree');
const { knowledgeTree } = require('./knowledge');

async function startResearch() {
	researchDebugger('Research system triggered...');
	const placeholder = await Research.findOne({ name: 'Empty Lab' });

	try {
		for await (const facility of await Facility.find({ 'capability.research.active': true })) {
			const research = facility.capability.research;

			for (let i = 0; i < research.capacity; i++) {
				const lab = {
					_id: facility._id,
					team: facility.team,
					name: `${facility.name} - 0${i + 1}`,
					index: i,
					project: research.projects[i],
					funding: research.funding[i],
					sciRate: research.sciRate,
					sciBonus: research.sciBonus,
					status: {
						pending: research.status.pending[i]
					}
				};

				if (lab.project.toHexString() === placeholder._id.toHexString()) {
					researchDebugger(`${lab.name} labs have no research to conduct...`);
					const projects = await Research.find({ team: facility.team, 'status.completed': false, type: 'Technology' });
					const rand = Math.floor(Math.random() * (projects.length - 1));

					if (projects.length > 0) {
						const project = projects[rand];
						researchDebugger(`${facility.name} labs have independently choosen to work on ${project.name}...`);
						lab.project = project._id;
						lab.funding = 0;
						await conductResearch(lab);
					}
				}
				else {
					researchDebugger(`${lab.name} has research to conduct`);
					await conductResearch(lab);
				}
			}
		}
		nexusEvent.emit('updateResearch');
		nexusEvent.emit('updateFacilities');
	}
	catch (err) {
		logger.error(`Research System Error: ${err.message}`, { meta: err });
	}
}

// FUNCTION for calculating the progress applied to a single RESEARCH project
async function conductResearch(lab) {
	researchDebugger(`${lab.name} has begun conducting research.`);
	let report = new ResearchReport;

	try {
		let tech = await Research.findById(lab.project).populate('team'); // Imports the specific Research object by _id
		if (tech != null) {
			researchDebugger(`Current Progress: ${tech.progress}`);
			report.progress.startingProgress = tech.progress; // Tracks progress in the Research Report
			// researchDebugger(tech)
			const team = await Team.findById(lab.team); // Finds the owner of the Lab
			report.project = tech._id; // Records the research being worked on
			report.lab = lab._id; // Records the lab working on the project
			researchDebugger(`Team Sci Rate: ${team.sciRate} - type: ${typeof team.sciRate}`);
			researchDebugger(`Lab Sci Rate: ${lab.sciRate} - type: ${typeof lab.sciRate}`);
			const sciRate = team.sciRate + lab.sciRate;
			const sciBonus = lab.sciBonus;
			researchDebugger(`Science Rate: ${sciRate}`);
			const progressInfo = await calculateProgress(sciRate, lab.funding, sciBonus); // Calculates progress by getting the teams sciRate, the funding level, and any relevant multiplery bonus

			if (tech.type === 'Knowledge') {
				tech.progress += progressInfo.progress; // Adds progress to the current Knowledge
				const index = tech.teamProgress.findIndex(el => el.team.name === team.name);
				tech.teamProgress[index].progress += progressInfo.progress;
			}
			else {
				tech.progress += progressInfo.progress; // Adds progress to the current Research
			}

			if (tech.progress >= techCost[tech.level] && tech.type !== 'Knowledge') tech.status.completed = true;
			if (tech.progress >= techCost[tech.level * 5] && tech.type === 'Knowledge') tech.status.pending = true; // Checks for compleation of current research

			const facility = await Facility.findById(lab._id);
			facility.capability.research.funding.set(lab.index, 0);
			facility.capability.research.status.pending.set(lab.index, false);

			if (tech.status.completed === true) {
				researchDebugger(`${tech.name} completed!`);
				const placeholder = await Research.findOne({ name: 'Empty Lab' });
				facility.capability.research.projects.set(lab.index, placeholder._id);

				tech = await completeResearch(tech);
			}
			else {
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
			report.stats.finalMultiplyer = progressInfo.finalMultiplier;
			report.rolls = progressInfo.rolls;
			report.outcomes = progressInfo.outcomes;
			report.stats.breakthroughCount = progressInfo.breakthroughs;
			report.date = Date.now();
			report = await report.saveReport();

			tech.researchHistory.push(report._id);
			facility.serviceRecord.push(report._id);
			await facility.save();
			tech = await tech.save(); // Saves the current project to the database
			if (tech.type === 'Knowledge') researchDebugger(tech);

			if (tech.type !== 'Knowledge') await advanceKnowledge(tech, lab);

			if (progressInfo.breakthroughs > 0) {
				await produceBreakthrough(tech, lab, progressInfo.breakthroughs);
			}
			return;
		}
	}
	catch (err) {
		logger.error(err);
		researchDebugger(`Research Error: ${err.message}`, { meta: err });
		return;
	}
}

// Calculates the multiplier for the current research project and returns the progress
function calculateProgress(sciRate, funding, sciBonus) {
	let finalMultiplier = 1 + sciBonus; // Gives the base multiplier calculated as 1 + any sciBonus the team or lab have
	const rolls = [];
	const outcomes = [];
	let breakthroughs = 0;
	// For loop that rolls a d6 per funding level, and either adds or subtracts from the base multiplier
	for (let i = 0; i < funding + 1; i++) {
		const roll = d6(); // Roll of a d6
		rolls.push(roll);

		researchDebugger(roll);

		// Switch for assigning the outcome of the multiplier roll.
		switch (true) {
		case (roll <= 1):
			researchDebugger('Set Back');
			finalMultiplier -= multiplier.setBack; // Reduction of the progress multiplier due to a set-back in the research
			outcomes.push('Setback');
			break;
		case (roll <= 3):
			researchDebugger('Progress');
			finalMultiplier += multiplier.normal; // Progress multiplier added to the final multiplier
			outcomes.push('Progress');
			break;
		case (roll <= 5):
			researchDebugger('Fast Progress');
			finalMultiplier += multiplier.fast; // Fast progress multiplier added to the final multiplier
			outcomes.push('Development');
			break;
		case (roll === 6):
			researchDebugger('Breakthrough');
			finalMultiplier += multiplier.breakthrough; // Breakthrough progress multiplier added to the final multiplier
			outcomes.push('Breakthrough');
			breakthroughs += 1;
			break;
		default:
			researchDebugger('Got to default...'); // This should never happen, if it does we have a coding error....
		}
	}

	researchDebugger(`Research finalMultiplier: ${finalMultiplier}`);
	const progress = Math.floor(sciRate * finalMultiplier); // Final calculation of progress on the technology
	researchDebugger(`Progress: ${progress}...`);
	return { progress, finalMultiplier, rolls, outcomes, breakthroughs }; // Returns progress to the Calculate Progress function.
}

// FUNCTION for finalizing a completed tech
async function completeResearch(research) {
	researchDebugger(`Enough progress has been made to complete ${research.name}...`);
	research.status.available = false;

	if (research.type === 'Knowledge') {
		research.status.pending = false;
		research.status.completed = true;
		if (research.level < 5) {
			const nextKnowledge = knowledgeTree.find(el => el.field === research.field && el.level === research.level + 1);
			const check = await Research.find({ name: nextKnowledge.name });
			if (check.length === 0) await nextKnowledge.unlock();
			researchDebugger(`UNLOCKING: ${research.type} - ${nextKnowledge.name}`);
		}
	}

	if (research.type === 'Technology') {
		for await (const item of research.unlocks) {
			if (item.type === 'Technology') {
				research.status.completed = true;
				const team = await Team.findById({ _id: research.team._id });
				const newTech = techTree.find(el => el.code === item.code);
				researchDebugger(`New Theory: ${item.type} - ${newTech.name}`);
				await newTech.unlock(team); // changed 'lab' to 'team'
			}
		}
	}

	research = await research.save();

	return research;
}

async function advanceKnowledge(research, lab) {
	for await (const knowledge of research.knowledge) {
		const project = await Research.findOne({
			type: 'Knowledge',
			field: knowledge.field,
			'status.available': true,
			'status.completed': false
		});
		if (project !== null) {
			lab.project = project._id;
			lab.funding = knowledge.rolls;
			researchDebugger(`Progressing Human Knowledge: ${project.type} - ${project.name}`);
			await conductResearch(lab);
		}
	}
	return;
}

async function produceBreakthrough(research, lab, count) {
	const options = [...research.breakthrough, ...research.unlocks];
	const team = await Team.findById(lab.team);
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
		const research = await Research.find({ 'status.pending': true, type: 'Knowledge' }); // Gets all pending knowledge from the DB
		researchDebugger(`${research.length} research to give credit for!`);

		// For loop that looks through each field that is pending
		for await (const field of research) {
			let credit = undefined; // Temp assignment of who gets credit for this research
			let creditName = undefined;
			let highProgress = 0; // Current highest progress

			// For loop that looks through each teams progress towards the knowledge field
			for await (const organization of field.teamProgress) {
				if (organization.progress > highProgress) {
					highProgress = organization.progress; // Assigns the current progress to highProgress if the team has more
					credit = organization.team._id; // Assigns the current organization to credit if the team has more
					creditName = organization.team.name;
				}
			}

			researchDebugger(`${creditName} has been credited with advancing ${field.name}`);
			field.credit = credit; // Gives credit to whatever team has the most at the end of the loop
			const knowledge = await field.save();
			await completeResearch(knowledge);
		}

		nexusEvent.emit('updateResearch');
		researchDebugger('Giving credit for research completed!');
	}
	catch (err) {
		logger.error(`Knowledge Credit Error: ${err.message}`, { meta: err });
	}
}

module.exports = { startResearch, conductResearch, assignKnowledgeCredit, techCost, fundingCost };