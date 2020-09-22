const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const banking = require('../wts/banking/banking'); // WTS Banking system
const Schema = mongoose.Schema; // Destructure of Schema
const { Account } = require('./account'); // Import of Account model [Mongoose]
const { Facility } = require('./facility'); // Import of Facility model [Mongoose]
const { Team } = require('./team'); // Import of Team model [Mongoose]
const { Site } = require('./site'); // Import of Site model [Mongoose]
const { Zone } = require('./zone');
const nexusEvent = require('../middleware/events/events');

// Aircraft Schema
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
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	country: { type: Schema.Types.ObjectId, ref: 'Country' },
	mission: { type: String, default: 'Docked' },
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
	systems: {
		cockpit: {
			active: { type: Boolean, default: true },
			damaged: { type: Boolean, default: false },
			destroyed: { type: Boolean, default: false }
		},
		engine: {
			active: { type: Boolean, default: true },
			damaged: { type: Boolean, default: false },
			destroyed: { type: Boolean, default: false }
		},
		weapon: {
			active: { type: Boolean, default: true },
			damaged: { type: Boolean, default: false },
			destroyed: { type: Boolean, default: false }
		},
		sensor: {
			active: { type: Boolean, default: true },
			damaged: { type: Boolean, default: false },
			destroyed: { type: Boolean, default: false }
		},
		armor: {
			active: { type: Boolean, default: true },
			damaged: { type: Boolean, default: false },
			destroyed: { type: Boolean, default: false }
		},
		utility: {
			active: { type: Boolean, default: true },
			damaged: { type: Boolean, default: false },
			destroyed: { type: Boolean, default: false }
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

// validateAircraft Method
AircraftSchema.methods.validateAircraft = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = {
		name: Joi.string().min(2).max(50).required(),
		type: Joi.string().min(2).max(50).required(),
		mission: Joi.string().required()
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	if (this.team === undefined) nexusError('No team ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(this.team)) nexusError('Invalid Team ID given...', 400);
	const team = await Team.findById(this.team);
	if (team.length < 1) nexusError(`No team exists with the ID: ${this.team}`, 400);

	if (this.origin === undefined) nexusError('No facility ID given for origin...', 400);
	if (!mongoose.Types.ObjectId.isValid(this.origin)) nexusError('Invalid facility ID given for origin...', 400);
	const facility = await Facility.findById(this.origin);
	if (facility.length < 1) nexusError(`No facility exists with the ID: ${this.origin}`, 400);

	if (this.site === undefined) nexusError('No site ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(this.site)) nexusError('Invalid site ID given...', 400);
	const site = await Site.findById(this.site);
	if (site.length < 1) nexusError(`No site exists with the ID: ${this.site}`, 400);

	if (this.zone === undefined) nexusError('No zone ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(this.zone)) nexusError('Invalid zone ID given...', 400);
	const zone = await Zone.findById(this.zone);
	if (zone.length < 1) nexusError(`No zone exists with the ID: ${this.zone}`, 400);

	if (this.country === undefined) nexusError('No country ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(this.country)) nexusError('Invalid country ID given...', 400);
	const country = await country.findById(this.country);
	if (country.length < 1) nexusError(`No country exists with the ID: ${this.country}`, 400);
};

AircraftSchema.methods.launch = async (mission) => {
	logger.info(`Attempting to launch ${this.name}...`);

	try {
		this.status.deployed = true;
		this.status.ready = false;

		const account = await Account.findOne({ name: 'Operations', 'team': this.team });
		if (account.balance < 1) nexusError('Insefficient Funds to launch', 400);
		await banking.withdrawal(account, 1, `Mission funding for ${mission.toLowerCase()} flown by ${this.name}`);

		const aircraft = await this.save();
		return aircraft;
	}
	catch (err) {
		if (err.status !== undefined) {
			nexusError(err.message, err.status);
		}
		else { 
			nexusError(err.message, 500);
		}
	}
};

AircraftSchema.methods.recall = async () => {
	logger.info(`Recalling ${this.name} to base...` );

	try {
		const { origin } = this;
		const home = await Facility.findById(origin)
			.populate('site');

		this.mission = 'Docked';
		this.status.ready = true;
		this.status.deployed = false;
		this.site = this.origin.site;
		this.country = home.site.country;
		this.zone = home.site.zone;

		const aircraft = await this.save();
		logger.info(`${this.name} returned to ${origin.name}...`);

		return aircraft;
	}
	catch (err) {
		nexusError(`${err.message}`, 500);
	}
};

const Aircraft = mongoose.model('Aircraft', AircraftSchema);

module.exports = { Aircraft };
