/* eslint-disable no-useless-catch */
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
const { AircraftAction } = require('./report'); // WTS Game log function

const randomCords = require('../util/systems/lz');
const clock = require('../wts/gameClock/gameClock');

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
	mission: { type: String, default: 'docked' },
	stance: { type: String, default: 'neutral', enum: ['aggresive', 'evasive', 'neutral'] },
	status: [ { type: String, enum: ['damaged', 'deployed', 'destroyed', 'ready', 'upgrade', 'repair', 'secret', 'mission', 'action'] } ],
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
	tags: [ { type: String, enum: [''] } ],
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }],
	lastUpdated: { type: Date, default: Date.now() }
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

// METHOD - Control
// IN - string of what is getting reset | OUT: VOID
// PROCESS: reset aspect based on type, Control only
AircraftSchema.methods.reset = async function (type) {
	let unit = this;
	try {
		switch(type) {
		case 'mission':
			// do mission reset logic
			(unit.missions <= 0) ? unit.missions = 1 : unit.missions = 0; // Reduces the availible missions by 1
			unit.mission = 'docked'; // Sets assignment as current mission TODO update when John redoes missions for aircraft
			await this.recall(true);
			break;
		case 'action':
			// do mission reset logic
			(unit.actions <= 0) ? unit.actions = 1 : unit.actions = 0; // Reduces the availible missions by 1
			break;
		case 'mobilized':
			// do mission reset logic
			await this.recall(true);
			break;
		default:
			throw new Error(`ERROR ${type}.`);
		}

		unit = await unit.save(); // Saves the UNIT
		await unit.populateMe();
		nexusEvent.emit('request', 'update', [ unit ]);
		return unit;
	}
	catch (error) {
		console.log(error);
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
		const resource = 'Megabucks';
		const index = account.resources.findIndex(el => el.type === resource);
		if (index < 0) {
			nexusError('Balance Not Found to launch', 400);
		}
		else if (account.resources[index].balance < 1) {nexusError('Insefficient Funds to launch', 400);}
		else {
			await account.withdrawal({ amount: 1, resource, note: `Mission funding for ${mission.toLowerCase()} flown by ${this.name}`, from: account._id });
		}

		const aircraft = await this.save();
		await aircraft.populateMe();

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
		await aircraft.populateMe();

		// Notify/Update team via socket-event
		nexusEvent.emit('request', 'update', [ aircraft ]); // Scott Note: Untested might not work

		logger.info(`${this.name} returned to ${home.name}...`);

		return aircraft;
	}
	catch (err) {
		nexusError(`${err.message}`, 500);
	}
};

// METHOD - Transfer
// IN: Target Facility | OUT: VOID
// PROCESS: Transfers aircraft to a new facility
AircraftSchema.methods.transfer = async function (facility) {
	await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present

	// Mechanics: Re-bases a military unit to a friendly facility around the world and sets the destination as the new home base.
	try {
		this.origin = facility; // Changes origin to target SITE
		const home = await Facility.findById(facility)
			.populate('site'); // Finds the new home site
		const transfer = { origin: this.site._id, destination: home.site._id };
		logger.info(`Transferring ${this.name} to ${home.name}...`);

		await clearArrayValue(this.status, 'deployed'); // Clears the DEPLOYED status if it exists
		const { lat, lng } = randomCords(home.site.geoDecimal.lat, home.site.geoDecimal.lng);
		this.location.lat = lat; // Updates LAT
		this.location.lng = lng; // Updates LNG
		this.site = home.site; // Updates current site
		this.organization = home.site.organization; // Updates the current organization
		this.zone = home.site.zone; // Updates current site

		this.markModified('status'); // Marks the STATUS array as modified so it will save

		const account = await Account.findOne({ name: 'Operations', team: this.team }); // Finds the operations account for the owner of the UNIT
		await account.spend({ amount: 1, note: `${this.name} transferred to ${home.name}`, resource: 'Megabucks' }); // Attempt to spend the money to go

		const unit = await this.save(); // Saves the UNIT into a new variable

		nexusEvent.emit('request', 'update', [ unit ]); // Triggers the update socket the front-end
		await this.report({ cost: 1, transfer }, 'Transfer');
		const message = `${this.name} transferred to ${this.site.name}.`;
		return message;
	}
	catch (err) {
		logger.error(`${err.message}`, { meta: err.stack });
		throw err;
	}
};

// Method - Repair
// IN: VOID | OUT: VOID
// PROCESS: Repairs units hull (Does it repair upgrades?) not currently
AircraftSchema.methods.repair = async function (upgrades = []) {
	await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present
	// eslint-disable-next-line no-useless-catch
	try {
		// Mechanics: Repairs damage to a military unit when they are at a facility with repair capabilities.
		const cost = 1 + upgrades.length;
		const account = await Account.findOne({ name: 'Operations', team: this.team }); // Finds the operations account for the owner of the UNIT
		await account.spend({ amount: cost, note: `Repairing ${this.name} and ${upgrades.length} upgrades`, resource: 'Megabucks' }); // Attempt to spend the money to go

		const dmgRepaired = this.stats.hullMax - this.stats.hull;
		this.stats.hull = this.stats.hullMax; // Restores the units hull to max

		for (const item of upgrades) {
			const upgrade = await Upgrade.findById(item);
			// upgrade.repair() // Call repair method of upgrade | TODO - Make repair method of upgrade
			console.log(`${upgrade.name} has been repaired while equiped to ${this.name}`);
		}

		const unit = await this.save(); // Saves the unit into a new variable
		await this.report({ dmgRepaired, cost }, 'Repair');
		nexusEvent.emit('request', 'update', [ unit ]); // Updates the front-end
		return unit;
	}
	catch (err) {
		throw err;
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
			await addArrayValue(upgrade.status, 'storage');
			await upgrade.save();
		}
		catch (err) {
			nexusError(`${err.message}`, 500);
		}
	}
	this.upgrades = [];
	const aircraft = await this.save();
	await aircraft.populateMe();

	// Notify/Update team via socket-event
	nexusEvent.emit('request', 'update', [ aircraft ]); // Scott Note: Untested might not work
	return aircraft;
};

// METHOD - takeAction
// IN: VOID | OUT: VOID
// PROCESS: Expends mission/action pts or errors if there are none
AircraftSchema.methods.takeAction = async function () {
	if (this.actions < 1) {
		// Trigger user check?
		if (this.missions < 1) {
			throw Error(`${this.name} has no mission or action pts left this turn.`);
		}
		else {
			this.missions -= 1;
		}
	}
	else {
		this.actions -= 1;
	}
};

AircraftSchema.methods.populateMe = function () {
	return this
		.populate('team', 'name shortName code')
		.populate('upgrades')
		.populate('zone', 'name')
		.populate('organization', 'name')
		.populate('site', 'name geoDecimal')
		.populate('origin', 'name')
		.execPopulate();
};

AircraftSchema.methods.report = async function (action, type) {
	const { repair, transfer, cost, dmgRepaired, equipt } = action;
	console.log(action)
	try {
		let report = new AircraftAction ({
			team: this.team,
			aircraft: this._id,
			// site: this.site._id,
			type,
			repair,
			dmgRepaired,
			equipt,
			transfer,
			cost
		});

		// transfer: {
			// origin: { type: Schema.Types.ObjectId, ref: 'Facility' },
			// destination: { type: Schema.Types.ObjectId, ref: 'Facility' }
		// },

		await report.createTimestamp();

		report = await report.save();
		report = await report.populateMe();

		// Notify/Update team via socket-event
		nexusEvent.emit('request', 'create', [ report ]); // Scott Note: Untested does not work
		console.log(`${type} report created...`);
	}
	catch (err) {
		console.log(err); // TODO: Add error handling
		return err;
	}
};

AircraftSchema.methods.upgrade = async function (upgradesAdd = [], upgradesRemove = []) {
	await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present
	// TODO add the mechanics of adding things to the UNIT
	// Mechanics: Changes out existing upgrades with anything currently stored.
	try {
		const unit = this;
		upgradesRemove.length > 0 ? await unit.unequip(upgradesRemove) : undefined;
		upgradesAdd.length > 0 ? await unit.equip(upgradesAdd) : undefined;
		const equipt = { upgradesRemove, upgradesAdd };
		await this.report({ equipt }, 'Equip');
		return unit;
	}
	catch (err) {
		throw err;
	}
};

// Method - Equip
// IN: VOID | OUT: VOID
// PROCESS: Changes the equipment of the unit
AircraftSchema.methods.equip = async function (upgrades = []) {
	// await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present
	// TODO add the mechanics of adding things to the UNIT
	// Mechanics: Changes out existing upgrades with anything currently stored.
	try {
		for (const upgrade of upgrades) {
			if (!this.upgrades.some(el => el === upgrade)) await addArrayValue(this.upgrades, upgrade); // Adds the MOBILIZED status into the STATUS array;
		}
		this.markModified('upgrades'); // Marks the UPGRADES array as modified so it will save.
		this.populate('upgrades').execPopulate(); // Populates the upgrads

		const unit = await this.save(); // Saves the UNIT into a new variable
		nexusEvent.emit('request', 'update', [ unit ]); // Triggers the update socket the front-end
		return unit;
	}
	catch (err) {
		throw err;
	}
};

// Method - Unequip
// IN: VOID | OUT: VOID
// PROCESS: Changes the equipment of the unit
AircraftSchema.methods.unequip = async function (upgrades = []) {
	// await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present
	// TODO add the mechanics of adding things to the UNIT
	// Mechanics: Changes out existing upgrades with anything currently stored.
	// console.log(this.upgrades)

	try {
		let temp = [ ... this.upgrades];
		for (const up of upgrades) {
			const index = temp.findIndex(el => el === up);
			temp.splice(index, 1);
		}

		this.upgrades = temp;
		this.markModified('upgrades'); // Marks the UPGRADES array as modified so it will save.
		this.populate('upgrades').execPopulate(); // Populates the upgrads


		const unit = await this.save(); // Saves the UNIT into a new variable
		nexusEvent.emit('request', 'update', [ unit ]); // Triggers the update socket the front-end
		return unit; // unit;
	}
	catch (err) {
		throw err;
	}
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
