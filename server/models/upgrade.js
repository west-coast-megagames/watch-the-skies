const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { validTeam } = require('../middleware/util/validateDocument');

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const UpgradeSchema = new Schema({
	model: { type: String, default: 'Upgrade' },
	name: { type: String, required: true, min: 2, maxlength: 50 },
	code: { type: String },
	team: { type: ObjectId, ref: 'Team' },
	unitType: { type: String },
	manufacturer: { type: ObjectId, ref: 'Team' },
	cost: { type: Number },
	buildTime: { type: Number, default: 0 },
	buildCount: { type: Number, default: 0 },
	desc: { type: String },
	prereq: [
		{
			type: { type: String },
			code: { type: String }
		}
	],
	status: {
		building: { type: Boolean, default: true },
		salvage: { type: Boolean, default: false },
		damaged: { type: Boolean, default: false },
		destroyed: { type: Boolean, default: false },
		storage: { type: Boolean, default: true }
	},
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	gameState: [],
	militaryStats: {
		category: {
			type: String,
			enum: ['Weapons', 'Vehicles', 'Transport', 'Training']
		},
		stats: {
			healthMax: { type: Number },
			attack: { type: Number },
			defense: { type: Number },
			localDeploy: { type: Number },
			globalDeploy: { type: Number },
			invasion: { type: Number }
		}
	},
	facilityStats: {
		stats: {
			sciRate: { type: Number },
			sciBonus: { type: Number },
			capacity: { type: Number }
		},
		effects: [
			{
				type: { type: String },
				effect: { type: Number }
			}
		]
	},
	aircraftStats: {
		category: {
			type: String,
			enum: ['Weapon', 'Engine', 'Sensor', 'Compartment', 'Util']
		},
		stats: {
			hullMax: { type: Number },
			attack: { type: Number },
			penetration: { type: Number },
			armor: { type: Number },
			shield: { type: Number },
			evade: { type: Number },
			range: { type: Number },
			cargo: { type: Number }
		}
	}
});

// validateUpgrade method
UpgradeSchema.methods.validateUpgrade = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);

	const schema = {
		name: Joi.string().min(2).max(50).required()
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.team);
	await validTeam(this.manufacturer);
};

const Upgrade = mongoose.model('Upgrade', UpgradeSchema);

module.exports = { Upgrade };
