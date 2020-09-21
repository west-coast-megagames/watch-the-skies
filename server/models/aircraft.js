const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:aircraftModel');
const Schema = mongoose.Schema;
const Joi = require('joi');
const { Facility } = require('./facility');
const { logger } = require('../middleware/log/winston');

const AircraftSchema = new Schema({
	model: { type: String, default: 'Aircraft' },
	type: {
		type: String,
		min: 2,
		maxlength: 50,
		enum: ['Recon', 'Transport', 'Decoy', 'Fighter'],
		default: 'Fighter'
	},
	name: { type: String, required: true, min: 2, maxlength: 50 },
	team: { type: Schema.Types.ObjectId, ref: 'Team' },
	site: { type: Schema.Types.ObjectId, ref: 'Site' },
	origin: { type: Schema.Types.ObjectId, ref: 'Facility' },
	mission: { type: String },
	status: {
		damaged: { type: Boolean, default: false },
		deployed: { type: Boolean, default: false },
		destroyed: { type: Boolean, default: false },
		ready: { type: Boolean, default: true },
		upgrade: { type: Boolean, default: false },
		repair: { type: Boolean, default: false },
		secret: { type: Boolean, default: false }
	},
	upgrades: [{ type: Schema.Types.ObjectId, ref: 'Upgrade' }],
	newSystems: {
		cockpit: {
			active: { type: Boolean, default: false },
			damaged: { type: Boolean, default: false }
		},
		engine: {
			active: { type: Boolean, default: false },
			damaged: { type: Boolean, default: false }
		},
		weapon: {
			active: { type: Boolean, default: false },
			damaged: { type: Boolean, default: false }
		},
		sensor: {
			active: { type: Boolean, default: false },
			damaged: { type: Boolean, default: false }
		},
		armor: {
			active: { type: Boolean, default: false },
			damaged: { type: Boolean, default: false }
		},
		utility: {
			active: { type: Boolean, default: false },
			damaged: { type: Boolean, default: false }
		}
	},
	stats: {
		hull: { type: Number, default: 0 },
		hullMax: { type: Number, default: 0 },
		attack: { type: Number, default: 0 },
		penetration: { type: Number, default: 0 },
		armor: { type: Number, default: 0 },
		evade: { type: Number, default: 0 },
		range: { type: Number, default: 0 },
		cargo: { type: Number, default: 0 },
		passiveRolls: [Number],
		activeRolls: [Number]
	},
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }],
	gameState: []
});

AircraftSchema.methods.launch = async (aircraft, mission) => {
	const banking = require('../wts/banking/banking');
	const { Account } = require('./account');

	try {
		modelDebugger(`Attempting to launch ${aircraft.name}`);
		aircraft.status.deployed = true;
		aircraft.status.ready = false;

		modelDebugger(aircraft.status);

		let account = await Account.findOne({
			name: 'Operations',
			'team.team_id': aircraft.team.team_id
		});

		account = await banking.withdrawal(
			account,
			1,
			`Deployment of ${aircraft.name} for ${mission.toLowerCase()}`
		);

		modelDebugger(account);
		await account.save();
		await aircraft.save();
		modelDebugger(`Aircraft ${aircraft.name} deployed...`);

		return aircraft;
	}
	catch (err) {
		modelDebugger('Error:', err.message);
	}
};

AircraftSchema.methods.returnToBase = async () => {
	logger.info(`Returning ${this.name} to ${origin.name}...`);

	const { origin } = this;
	await Facility.populate(this, { path: 'origin', model: 'Facility' });

	this.mission = 'Docked';
	this.status.ready = true;
	this.status.deployed = false;
	this.site = origin.site;

	const aircraft = await this.save();

	return aircraft;
};

AircraftSchema.methods.validateAircraft = function (aircraft) {
	const schema = {
		name: Joi.string().min(2).max(50).required(),
		type: Joi.string().min(2).max(50)
	};

	return Joi.validate(aircraft, schema, { allowUnknown: true });
};

let Aircraft = mongoose.model('Aircraft', AircraftSchema);

function validateAircraft (aircraft) {
	// modelDebugger(`Validating ${aircraft.name}...`);

	const schema = {
		name: Joi.string().min(2).max(50).required(),
		type: Joi.string().min(2).max(50)
	};

	return Joi.validate(aircraft, schema, { allowUnknown: true });
}

async function getAircrafts () {
	modelDebugger('Retriving all aircraft documents...');
	let aircrafts = await Aircraft.find()
		.sort({ team: 1 })
		.populate('team', 'name shortName')
		.populate('zone', 'name')
		.populate('country', 'name')
		.populate('systems', 'name category')
		.populate('origin', 'name');
	return aircrafts;
}

module.exports = { Aircraft, validateAircraft, getAircrafts };
