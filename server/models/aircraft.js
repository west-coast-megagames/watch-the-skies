const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const banking = require('../wts/banking/banking'); // WTS Banking system
const Schema = mongoose.Schema; // Destructure of Schema
const { Account } = require('./account'); // Import of Account model [Mongoose]
const { Facility } = require('./facility'); // Import of Facility model [Mongoose]
const { Upgrade } = require('./upgrade'); // Import of Upgrade model [Mongoose]
const randomCords = require('../util/systems/lz');

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
	team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	location: {
		lat: { type: Number },
		lng: { type: Number }
	},
	site: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
	origin: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
	country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
	blueprint: { type: Schema.Types.ObjectId, ref: 'Blueprint', required: true },
	mission: { type: String, default: 'Docked' },
	stance: { type: String, default: 'neutral', enum: ['aggresive', 'evasive', 'neutral'] },
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
		detection: { type: Number, default: 1 },
		range: { type: Number, default: 0 },
		cargo: { type: Number, default: 0 }
	},
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }],
	gameState: []
});

// validateAircraft Method
AircraftSchema.methods.validateAircraft = async function () {
	const { validTeam, validFacility, validSite, validZone, validCountry, validUpgrade, validLog } = require('../middleware/util/validateDocument');

	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		type: Joi.string().min(2).max(50).required().valid('Recon', 'Transport', 'Decoy', 'Fighter'),
		mission: Joi.string().required()
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.team);
	await validFacility(this.origin);
	await validSite(this.site);
	await validZone(this.zone);
	await validCountry(this.country);
	for await (const upg of this.upgrades) {
		await validUpgrade(upg);
	}
	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
	}
};

// Launch Method - Changes the status of the craft and pays for the launch.
AircraftSchema.methods.launch = async function (mission) {
	logger.info(`Attempting to launch ${this.name}...`);

	try {
		this.status.deployed = true;
		this.status.ready = false;
		this.mission = mission;

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


// Recall method - Returns the craft to origin
AircraftSchema.methods.recall = async function () {
	logger.info(`Recalling ${this.name} to base...`);

	try {
		const { origin } = this;
		const home = await Facility.findById(origin)
			.populate('site');

		this.mission = 'Docked';
		this.status.ready = true;
		this.status.deployed = false;
		this.location = randomCords(home.site.geoDecimal.latDecimal, home.site.geoDecimal.longDecimal);
		this.site = home.site;
		this.country = home.site.country;
		this.zone = home.site.zone;

		const aircraft = await this.save();
		logger.info(`${this.name} returned to ${home.name}...`);

		return aircraft;
	}
	catch (err) {
		nexusError(`${err.message}`, 500);
	}
};

// stripUpgrades method - Removes all upgrades from a craft
AircraftSchema.methods.stripUpgrades = async function () {
	if (this.upgrades.length < 1) {
		logger.info(`${this.name} has no upgrades...`);
		return this;
	}
	logger.info(`Stripping ${this.name} of ${this.upgrade.length} upgrades...`);
	for (let upgrade of this.upgrades) {
		try {
			upgrade = await Upgrade.findById(upgrade);
			upgrade.status.storage = true;
			await upgrade.save();
		}
		catch (err) {
			nexusError(`${err.message}`, 500);
		}
	}
	this.upgrades = [];
	const aircraft = await this.save();
	return aircraft;
};

const Aircraft = mongoose.model('Aircraft', AircraftSchema);

module.exports = { Aircraft };
