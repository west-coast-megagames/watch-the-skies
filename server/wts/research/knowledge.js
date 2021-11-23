const fs = require('fs');
const file = fs.readFileSync(require.resolve('../json/knowledge.json'));
const knowledgeData = JSON.parse(file);
const knowledgeDebugger = require('debug')('app:knowledge');
const { clearArrayValue, addArrayValue } = require('../../middleware/util/arrayCalls');

const { Team } = require('../../models/team'); // Team Model
const { Research, KnowledgeResearch } = require('../../models/research'); // Research model and Knowledge Discriminator

// Science Game State
const { techTree } = require('./techTree'); // Import of the tech tree array from techTree.js
const knowledgeCost = [ 30, 60, 100, 150, 220, 300 ]; // Cost for each level of tech, arbitratily set at increments of 10 currently
const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science', 'Physics', 'Psychology', 'Social Science', 'Quantum Mechanics'];
const knowledgeTree = []; // Tree of all knowledge classes in the game, loaded on server load
let controlTeam = {}; // Current control team from DB
let teamProgress = []; // Progress array for Knowledge classes
const seed = true; // Are we currently seeding boolean

//
async function loadGlobalVariables () {
	const progress = [];
	let count = 0;
	const control = await Team.find({ code: 'TCN' });
	for await (const team of await Team.find({ type: 'National' })) {
		const el = { team: { _id: team._id, name: team.name }, progress: 0 };
		progress.push(el);
		count++;
	}
	knowledgeDebugger(`Loaded ${count} teams into progress...`);
	teamProgress = progress;
	controlTeam = control;
}

// Load function to load all knowledge fields and levels into the the server side knowledgeTree.
async function loadKnowledge () {
	let count = 0;

	await knowledgeData.forEach(knowledge => {
		knowledgeTree[count] = new KnowledgeClass(knowledge);
		// knowledgeDebugger(`${knowledge.name} Loaded...`)
		count++;
	});
	knowledgeDebugger(`${count} knowledge loaded into tree...`);
	return `${count} knowledge loaded into tree...`;
}

async function knowledgeSeed () {
	const result = await Research.deleteMany();
	knowledgeDebugger(`${result.deletedCount} research deleted...`);
	const seeded = [];
	let i = 1;

	// Iterates over the knowledge array above
	for await (const field of fields) {
		knowledgeDebugger(field);
		knowledgeDebugger(`Seed count: ${i}`);
		const rand = 1 + Math.floor(Math.random() * 3);
		knowledgeDebugger(rand);
		const currentSeed = await knowledgeTree.find(el => el.field === field && el.level === rand);
		seeded.push(currentSeed);
		knowledgeDebugger(`${currentSeed.name} rolled as seed...`);
		i++;
	}

	for await (const knowledge of seeded) {
		// Knowledge.unlock is the Method of the Knowledge Class that unlocks the next knowledge level of a field
		let newKnowledge = await knowledge.unlock();

		const tree = knowledgeTree;

		let index = 0;

		while (newKnowledge.level !== 0 && index !== -1) {
			index = tree.findIndex(field => field.field === newKnowledge.field && field.level === newKnowledge.level - 1);

			if (index != -1) {
				newKnowledge = await tree[index].seed();
				// knowledgeDebugger(newKnowledge)
				if (newKnowledge.teamProgress.length > 0) {
					let rand = Math.floor(Math.random() * (newKnowledge.teamProgress.length - 1));
					rand = Math.max(rand, 0); // don't go negative
					newKnowledge.teamProgress[rand].progress = newKnowledge.progress;
				}
				knowledgeDebugger('Completing knowledge');
				await completeKnowledge(newKnowledge);
				knowledgeDebugger('Publishing Science');
				await publishKnowledge(newKnowledge);
			}
		}
	}
	
	knowledgeDebugger('Knowledge seed complete...');
	return;
}

// KnowledgeClass Constructor Function
function KnowledgeClass (knowledge) {
	this.name = knowledge.name;
	this.level = knowledge.level;
	this.prereq = knowledge.prereq;
	this.desc = knowledge.desc;
	this.field = knowledge.field;
	this.code = knowledge.code;
	this.unlocks = knowledge.unlocks;
	this.teamProgress = teamProgress;

	// Method that seeds knowledge pre-game
	this.seed = async function () {
		knowledgeDebugger(`Seeding: ${this.name}`);
		const newKnowledge = new KnowledgeResearch({
			name: this.name,
			level: this.level,
			prereq: this.prereq,
			desc: this.desc,
			credit: controlTeam._id,
			field: this.field,
			code: this.code,
			unlocks: this.unlocks,
			progress: knowledgeCost[this.level],
			teamProgress: this.teamProgress
		});
		await addArrayValue(newKnowledge.status, 'completed');
		await addArrayValue(newKnowledge.status, 'published');
		await clearArrayValue(newKnowledge.status, 'available');

		await newKnowledge.save();
		knowledgeDebugger(`${newKnowledge.name} seeded...`);
		knowledgeDebugger(`${newKnowledge.name} has been completed pre-game...`);

		return newKnowledge;
	};

	// Method that unlocks a knowledge level
	this.unlock = async function () {
		console.log(`Unlocking ${this.name}`);
		let newKnowledge = new KnowledgeResearch({
			name: this.name,
			level: this.level,
			prereq: this.prereq,
			desc: this.desc,
			field: this.field,
			code: this.code,
			unlocks: this.unlocks,
			teamProgress: this.teamProgress
		});
		await clearArrayValue(newKnowledge.status, 'completed');
		await clearArrayValue(newKnowledge.status, 'published');
		await addArrayValue(newKnowledge.status, 'available');

		newKnowledge = await newKnowledge.save();

		knowledgeDebugger(`${newKnowledge.name} has been unlocked for research!`);

		return newKnowledge;
	};
}

async function completeKnowledge (research) {
	knowledgeDebugger(`Enough progress has been made to complete ${research.name}...`);
	await addArrayValue(research.status, 'completed');
	await clearArrayValue(research.status, 'available');

	const highestProgress = 0;
	for await (const team of research.teamProgress) {
		if (team.progress > highestProgress) research.credit = team.team;
	}
	const team = await Team.findById(research.credit);
	// credit = await Team.findById(research.credit);
	knowledgeDebugger(`${team.name} has been credited with advancing the world to ${research.name}`);

	research = await research.save();

	if (!seed) {
		for await (const tech of research.unlocks) {
			const newTech = techTree.find(el => el.code === tech.code);
			await newTech.checkAvailable();
		}
	}

	return research;
}

async function publishKnowledge (research) {
	const team = await Team.findById(research.credit);
	knowledgeDebugger(`${team.name} is publishing ${research.name}...`);
	await addArrayValue(research.status, 'published');

	research = await research.save();

	return research;
}

module.exports = { KnowledgeClass, loadKnowledge, knowledgeSeed, completeKnowledge, knowledgeTree, loadGlobalVariables };