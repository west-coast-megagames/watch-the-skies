const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

// type can be: "Civilian", "Crises", "Hanger", "Research", "Base" currently
const FacilitySchema = new Schema({
	model: { type: String, default: 'Facility' },
	type: { type: String, min: 2, maxlength: 50 },
	name: { type: String, required: true, min: 2, maxlength: 50 },
	team: { type: ObjectId, ref: 'Team' },
	site: { type: ObjectId, ref: 'Site' },
	code: {
		type: String,
		minlength: 2,
		maxlength: 20,
		required: true,
		unique: true
	},
	status: [ {type: String, enum: ['repair','damaged', 'destroyed', 'secret', 'defenses']} ],
	hidden: { type: Boolean, default: false },
	upgrade: [{ type: ObjectId, ref: 'Upgrade' }],
	capability: {
		research: {
			capacity: { type: Number, default: 0 },
			projects: [{ type: ObjectId, ref: 'Research' }],
			funding: [Number],
			sciRate: { type: Number, default: 0 },
			sciBonus: { type: Number, default: 0 },
			active: { type: Boolean },
			status: {
				damage: [Boolean],
				pending: [Boolean]
			}
		},
		airMission: {
			capacity: { type: Number, default: 0 },
			damage: [Boolean],
			aircraft: [{ type: ObjectId, ref: 'Aircraft' }],
			active: { type: Boolean, default: false }
		},
		storage: {
			capacity: { type: Number, default: 0 },
			damage: [Boolean],
			active: { type: Boolean, default: false }
		},
		manufacturing: {
			capacity: { type: Number, default: 0 },
			damage: [Boolean],
			active: { type: Boolean, default: false }
		},
		naval: {
			capacity: { type: Number, default: 0 },
			damage: [Boolean],
			fleet: [{ type: ObjectId, ref: 'Military' }],
			active: { type: Boolean, default: false }
		},
		ground: {
			capacity: { type: Number, default: 0 },
			damage: [Boolean],
			corps: [{ type: ObjectId, ref: 'Military' }],
			active: { type: Boolean, default: false }
		}
	},
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	tags: [ {type: String, enum: ['coastal']} ]
});

FacilitySchema.methods.validateFacility = async function () {
	const { validTeam, validSite, validUpgrade, validResearch, validAircraft, validMilitary } = require('../middleware/util/validateDocument');

	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		type: Joi.string().min(2).max(50).valid('Civilian', 'Crises', 'Hanger', 'Research', 'Base'),
		code: Joi.string().min(2).max(20).required(),
		tags: Joi.array().items(Joi.string().valid('coastal')),
		status: Joi.array().items(Joi.string().valid('repair', 'damaged', 'destroyed', 'secret', 'defenses'))
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	if (this.site) {
		await validSite(this.site);
	}

	if (this.team) {
		await validTeam(this.team);
	}

	for await (const upg of this.upgrade) {
		await validUpgrade(upg);
	}
	for await (const rsrch of this.capability.research.projects) {
		await validResearch(rsrch);
	}

	for await (const aircrft of this.capability.airMission.aircraft) {
		await validAircraft(aircrft);
	}

	for await (const nav of this.capability.naval.fleet) {
		await validMilitary(nav);
	}

	for await (const cor of this.capability.ground.corps) {
		await validMilitary(cor);
	}
};

const Facility = mongoose.model('Facility', FacilitySchema);

module.exports = { Facility };
