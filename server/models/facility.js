const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { validTeam, validSite } = require('../middleware/util/validateDocument');

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
	status: {
		repair: { type: Boolean, default: true },
		damaged: { type: Boolean, default: false },
		destroyed: { type: Boolean, default: false },
		secret: { type: Boolean, default: false },
		defenses: { type: Boolean, default: false }
	},
	hidden: { type: Boolean, default: false },
	gameState: [],
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
	}
});

FacilitySchema.methods.validateFacility = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = {
		name: Joi.string().min(2).max(50).required()
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validSite(this.site);
	await validTeam(this.team);
};

const Facility = mongoose.model('Facility', FacilitySchema);

module.exports = { Facility };
