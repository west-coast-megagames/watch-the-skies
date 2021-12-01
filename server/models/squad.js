const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const clock = require('../wts/gameClock/gameClock');
// const nexusEvent = require('../middleware/events/events');
const die = require('../util/systems/dice');
const { AgentAction } = require('../models/report');

const SquadSchema = new Schema({
	model: { type: String, default: 'Squad' },
	type: {
		type: String,
		default: 'Raid',
		enum: ['Raid', 'Assault', 'Infiltration', 'Envoy', 'Science']
	},
	name: { type: String, required: true, min: 2, maxlength: 50, unique: true },
	team: { type: Schema.Types.ObjectId, ref: 'Team' },
	rollBonus: { type: Number, required: true, default: 0 }, // possibly defunct
	upgrades: [{ type: ObjectId, ref: 'Upgrade' }],
	stats: {
		clandestine: { type: Number, default: 0 },
		effectiveness: { type: Number, default: 0 },
		survivability: { type: Number, default: 0 }
	},
	missionType: { type: String, default: 'Awaiting Mission', enum: ['Awaiting Mission', 'Counter-Espionage', 'Gather Intel', 'Sabotage', 'Heist'] },
	mission: {
		priorities: [{ type: String, enum: ['clandestine', 'effectiveness', 'survivability'] }]
	},
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
	site: { type: Schema.Types.ObjectId, ref: 'Site' },
	origin: { type: Schema.Types.ObjectId, ref: 'Facility' },
	location: {
		lat: { type: Number },
		lng: { type: Number }
	},
	lastUpdate: { type: Date, default: Date.now() },
	status: [ { type: String, enum: ['deployed', 'destroyed', 'ready', 'captured', 'damaged'] } ],
	tags: [ { type: String, enum: [''] } ]
});

SquadSchema.methods.runMission = async function () {
	if (!this.status.some(el => el === 'mission')) throw Error(`The ${this.name} squad has no misssion...`);
	let cland = false;	// boolean for mission secrecy
	let surv = false;		// boolean for squad survival
	let succ = false;		// boolean for mission success
	let numRes = 0;			// number for iterating over array later

	const { site } = this;
	const squads = await Squad.find({ site, missionType: 'Counter-Espionage' }).lean();

	const result = die.d6() + die.d6() - squads.length; // 1 Roll 2d6
	console.log(`The Result was ${result}`);
	if (result < 6) {
		numRes = 1;
	}
	else if (result > 5 && result < 9) {
		numRes = 2;
	}
	else if (result > 8) {
		numRes = 3;
	}

	for (let i = 0; i < numRes; i++) {
		switch (this.mission.priorities[i]) {
		case 'clandestine':
			cland = true;
			break;
		case 'effectiveness':
			succ = true;
			break;
		case 'survivability':
			surv = true;
			break;
		}
	}

	if (!cland) { // if the squad was detected, make a report for the target team
		console.log(`${this.name} was detected`);
	}
	if (!surv) { // if the squad was killed or captured
		console.log(`${this.name} was killed`);
	}
	if (succ) { // if the mission was succsessful
		// 3 resolve the mission based on the type
		console.log(`${this.name} was successful in their mission`);
	}

	let missionReport = new AgentAction({
		date: Date.now(),
		timestamp: clock.getTimeStamp(),
		team: this.team,
		site: this.site,
		missionType: this.missionType,
		priorities: this.mission.priorities,
		result: numRes
	}); // the report for the squad's team
	missionReport = await missionReport.save();

	// TODO - Add event based updating...
	return;
};

// validateSquad Method
SquadSchema.methods.validateSquad = async function () {
	const { validTeam, validSite, validFacility, validOrganization, validZone, validUpgrade } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		type: Joi.string().valid('Raid', 'Assault', 'Infiltration', 'Envoy', 'Science'),
		status: Joi.array().items(Joi.string().valid('deployed', 'destroyed', 'ready', 'captured', 'damaged')),
		tags: Joi.array().items(Joi.string().valid(''))
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validSite(this.site);
	await validTeam(this.team);
	await validOrganization(this.organization);
	await validZone(this.zone);
	await validFacility(this.origin);
	for await (const upg of this.upgrades) {
		await validUpgrade(upg);
	}
};

const Squad = mongoose.model('Squad', SquadSchema);

module.exports = { Squad };
