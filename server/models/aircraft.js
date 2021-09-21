const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const nexusEvent = require('../middleware/events/events');
const { clearArrayValue, addArrayValue } = require('../middleware/util/arrayCalls');

// Global Constants
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
	organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
	blueprint: { type: Schema.Types.ObjectId, ref: 'Blueprint' },
	mission: { type: String, default: 'Docked' },
	stance: { type: String, default: 'neutral', enum: ['aggresive', 'evasive', 'neutral'] },
	status: [ {type: String, enum: ['damaged', 'deployed', 'destroyed', 'ready', 'upgrade', 'repair', 'secret', 'mission', 'action']} ],
	actions: { type: Number, default: 1 },
	missions: { type: Number, default: 1 },
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
	tags: [ {type: String, enum: ['']} ],
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }]
});

// validateAircraft Method
AircraftSchema.methods.validateAircraft = async function () {
	const { validTeam, validFacility, validSite, validZone, validOrganization, validUpgrade, validLog } = require('../middleware/util/validateDocument');

	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		type: Joi.string().min(2).max(50).required().valid('Recon', 'Transport', 'Decoy', 'Fighter'),
		mission: Joi.string().required(),
		tags: Joi.array().items(Joi.string().valid('')),
		status: Joi.array().items(Joi.string().valid('damaged', 'deployed', 'destroyed', 'ready', 'upgrade', 'repair', 'secret', 'mission', 'action'))
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.team);
	await validFacility(this.origin);
	await validSite(this.site);
	await validZone(this.zone);
	await validOrganization(this.organization);
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

		await addArrayValue(this.status, 'deployed');
		await clearArrayValue(this.status, 'ready');
		this.mission = mission;
		await clearArrayValue(this.status, 'mission');

		const account = await Account.findOne({ name: 'Operations', 'team': this.team });
		// TODO John Review how to update for resources
		let resource = 'Megabucks';
		let index = account.resources.findIndex(el => el.type === resource);
		if (index < 0) {
			nexusError('Balance Not Found to launch', 400);
		} 
		else {
			if (account.resources[index].balance < 1) nexusError('Insefficient Funds to launch', 400);
			else {
				await account.withdrawal({ amount: 1, note: `Mission funding for ${mission.toLowerCase()} flown by ${this.name}`, from: account._id });
			}
		}

		const aircraft = await this.save();
		await aircraft.populateAircraft();

		// Notify/Update team via socket-event
		nexusEvent.emit('request', 'update', [ aircraft ]); // Scott Note: Untested might not work
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

    await addArrayValue(this.status, 'ready');
		await clearArrayValue(this.status, 'deployed');
		this.location = randomCords(home.site.geoDecimal.lat, home.site.geoDecimal.lng);
		this.site = home.site;
		this.organization = home.site.organization;
		this.zone = home.site.zone;

		await clearArrayValue(this.status, 'mission');
		await clearArrayValue(this.status, 'action');

		const aircraft = await this.save();
		await aircraft.populateAircraft();

		// Notify/Update team via socket-event
		nexusEvent.emit('request', 'update', [ aircraft ]); // Scott Note: Untested might not work

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
	await aircraft.populateAircraft();

	// Notify/Update team via socket-event
	nexusEvent.emit('request', 'update', [ aircraft ]); // Scott Note: Untested might not work
	return aircraft;
};

AircraftSchema.methods.populateAircraft = function () {
	return this
		.populate('team', 'name shortName code')
		.populate('zone', 'name')
		.populate('organization', 'name')
		.populate('site', 'name geoDecimal')
		.populate('origin', 'name')
		.execPopulate();
};

const Aircraft = mongoose.model('Aircraft', AircraftSchema);

// { Aircraft Selectior Functions }
const getAircrafts = async function () {
	try {
		const aircrafts = await Aircraft.find()
			.sort({ team: 1 })
			.populate('team', 'name shortName code')
			.populate('zone', 'name')
			.populate('organization', 'name')
			.populate('site', 'name geoDecimal')
			.populate('origin', 'name');
		return aircrafts;
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
	}
};

module.exports = { Aircraft, getAircrafts };
