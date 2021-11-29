/* eslint-disable no-useless-catch */
const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { clearArrayValue, addArrayValue } = require('../middleware/util/arrayCalls');
const nexusEvent = require('../middleware/events/events');

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID
const { Facility } = require('./facility'); // Import of Facility model [Mongoose]
const { Account } = require('./account'); // Import of Account model [Mongoose]
const { Site } = require('./site'); // Import of Site model [Mongoose]
const { Upgrade } = require('./upgrade'); // Import of Upgrade model [Mongoose]
const { MilitaryAction } = require('./report'); // WTS Game log function

// Utility Imports
const { getDistance } = require('../util/systems/geo'); // Geographic UTIL responsible for handling lat/lng functions
const randomCords = require('../util/systems/lz'); // Random coordinate UTIL responsible for giving a lat/lng seperate from target site

const MilitarySchema = new Schema({
	model: { type: String, default: 'Military' },
	name: { type: String, required: true, min: 2, maxlength: 50, unique: true },
	team: { type: ObjectId, ref: 'Team' },
	zone: { type: ObjectId, ref: 'Zone' },
	organization: { type: ObjectId, ref: 'Organization' },
	site: { type: ObjectId, ref: 'Site' },
	origin: { type: ObjectId, ref: 'Facility' },
	blueprint: { type: Schema.Types.ObjectId, ref: 'Blueprint' },
	upgrades: [{ type: ObjectId, ref: 'Upgrade' }],
	actions: { type: Number, default: 1 },
	missions: { type: Number, default: 1 },
	assignment: {
		target: { type: ObjectId, ref: 'Site' },
		type: { type: String, default: 'Garrison', enum: ['Invade', 'Siege', 'Terrorize', 'Raze', 'Humanitarian', 'Garrison'] }
	},
	hidden: { type: Boolean, default: false },
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	location: {
		lat: { type: Number },
		lng: { type: Number }
	},
	status: [{ type: String, enum:  ['damaged', 'deployed', 'destroyed', 'repair', 'mobilized', 'operational', 'action', 'mission'] } ],
	tags: {
		type: [String],
		enum: ['secret']
	}
});

// METHOD - Control
// IN - string of what is getting reset | OUT: VOID
// PROCESS: reset aspect based on type, Control only
MilitarySchema.methods.reset = async function (type) {
	let unit = this;
	try {
		switch(type) {
		case 'mission':
			// do mission reset logic
			(unit.missions <= 0) ? unit.missions = 1 : unit.missions = 0; // Reduces the availible missions by 1
			unit.assignment = { type: 'Garrison' }; // Sets assignment as current mission
			break;
		case 'action':
			// do mission reset logic
			(unit.actions <= 0) ? unit.actions = 1 : unit.actions = 0; // Reduces the availible missions by 1
			break;
		case 'mobilized':
			// do mission reset logic
			(!this.status.some(el => el === 'mobilized')) ?
				await this.mobilize(true) : await this.recall(true);
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

// METHOD - Mission
// IN - Mission Object { target, type } | OUT: VOID
// PROCESS: Checks to see if the UNIT is able to go on the mission, pays the cost.
MilitarySchema.methods.mission = async function (assignment) {
	if (!this.status.some(el => el === 'mobilized')) throw new Error(`${this.name} is not mobilized.`); // Checks if the UNIT is mobalized
	if (this.missions < 1) throw new Error(`${this.name} cannot deploy for another mission this turn.`); // Checks if the UNIT has a mission availible

	let unit = this;
	unit.assignment = assignment; // Sets assignment as current mission
	if (this.site._id.toString() !== assignment.target) unit = await unit.deploy(assignment.target);

	try {
		unit.missions -= 1; // Reduces the availible missions by 1

		unit = await unit.save(); // Saves the UNIT
		await unit.populateMe();

		nexusEvent.emit('request', 'update', [ unit ]);

		return unit;
	}
	catch (error) {
		console.log(error);
	}
};

// METHOD - Deploy
// IN: Site _id | OUT: VOID
// PROCESS: Deploys a UNIT to a site.
MilitarySchema.methods.deploy = async function (site) {
	// Mechanics: Allows a mobilized military unit to go to any site that currently has friendly units with the encampment status. (Status gained by being in the site last turn regardless of site ownership)

	const target = await Site.findById(site).populate('country').populate('zone'); // Finds deployment target in the DB
	logger.info(`Deploying ${this.name} to ${target.name} in the ${target.zone.name} zone`);

	try {
		let cost = 0;
		const distance = getDistance(this.location.lat, this.location.lng, target.geoDecimal.lat, target.geoDecimal.lng); // Get distance to target in KM
		// if (distance > this.range * 4) throw new Error(`${target.name} is beyond the deployment range of ${this.name}.`); // Error for beyond operational range
		distance < this.range ? cost = this.stats.localDeploy : cost = this.stats.globalDeploy;

		if (!this.status.some(el => el === 'deployed')) {
			addArrayValue(this.status, 'deployed');
			this.markModified('status');
		}

		this.site = target._id;
		this.country = target.country;
		this.zone = target.zone;
		const { lat, lng } = randomCords(target.geoDecimal.lat, target.geoDecimal.lng);

		this.location.lat = lat;
		this.location.lng = lng;

		const account = await Account.findOne({ name: 'Operations', team: this.team }); // Finds the operations account for the owner of the UNIT
		await account.spend({ amount: cost, note: `${this.name} deployed to ${target.name}`, resource: 'Megabucks' }); // Attempt to spend the money to go

		const unit = await this.save();
		await unit.populateMe();

		nexusEvent.emit('request', 'update', [ unit ]);
		return unit;
	}
	catch (err) {
		logger.error(`Catch Military Model deploy Error: ${err.message}`, { meta: err.stack });
		throw err;
	}
};

// METHOD - Recall
// IN: forced <<Boolean>> | OUT: VOID
// PROCESS: Returns the unit to origin base
MilitarySchema.methods.recall = async function (forced = false) {
	if (!forced) await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present

	// Returns a military unit to their home-base, removing the mobilized status.
	try {
		const { origin } = this;
		const home = await Facility.findById(origin)
			.populate('site'); // Finds the new home site

		// logger.info(`${this.name} is being recalled to ${home.name}...`);

		await clearArrayValue(this.status, 'deployed'); // Clears the DEPLOYED status if it exists
		await clearArrayValue(this.status, 'mobilized'); // Clears the MOBILIZED status if it exists
		const { lat, lng } = randomCords(home.site.geoDecimal.lat, home.site.geoDecimal.lng);
		this.location.lat = lat; // Updates LAT
		this.location.lng = lng; // Updates LNG
		this.site = home.site; // Updates current site
		this.organization = home.site.organization; // Updates the current organization
		this.zone = home.site.zone; // Updates current site
		this.assignment = { type: 'Garrison' }; // Sets assignment as current mission

		this.markModified('status'); // Marks the STATUS array as modified so it will save

		const unit = await this.save(); // Saves the UNIT into a new variable
		nexusEvent.emit('request', 'update', [ unit ]); // Triggers the update socket the front-end
		logger.info(`${this.name} returned to ${home.name}...`);

		return unit;
	}
	catch (err) {
		nexusError(`${err.message}`, 500);
	}
};

// METHOD - Mobilize
// IN: VOID | OUT: VOID
// PROCESS: Mobilizes unit in preporation for action
MilitarySchema.methods.mobilize = async function (forced = false) {
	if (!forced) await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present

	// Switch a military unit to the mobilized status, making it more visible on the map but ready to do missions.
	try {
		logger.info(`${this.name} is mobilizing...`);

		await addArrayValue(this.status, 'mobilized'); // Adds the MOBILIZED status into the STATUS array
		this.markModified('status'); // Marks the STATUS array as modified so it will save
		const { lat, lng } = randomCords(this.site.geoDecimal.lat, this.site.geoDecimal.lng);
		this.location.lat = lat; // Updates LAT
		this.location.lng = lng; // Updates LNG
		const unit = await this.save(); // Saves the UNIT into a new variable
		nexusEvent.emit('request', 'update', [ unit ]); // Triggers the update socket the front-end

		return unit;
	}
	catch (err) {
		logger.error(`${err.message}`, { meta: err.stack });
		throw err;
	}
};

// METHOD - Transfer
// IN: Target Facility | OUT: VOID
// PROCESS: Transfers a unit to a new facility
MilitarySchema.methods.transfer = async function (facility) {
	await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present

	// Mechanics: Re-bases a military unit to a friendly facility around the world and sets the destination as the new home base.
	try {
		this.origin = facility; // Changes origin to target SITE
		const home = await Facility.findById(facility)
			.populate('site'); // Finds the new home site

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

		return unit;
	}
	catch (err) {
		logger.error(`${err.message}`, { meta: err.stack });
		throw err;
	}
};

// METHOD - Recon
// IN: Target Site | OUT: VOID
// PROCESS: Generates intel in the target site
MilitarySchema.methods.recon = async function (site) {
	await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present
	try {
		let unit = this;
		if (unit.site._id.toString() !== site) unit = await unit.deploy(site);

		const target = await Site.findById(site).populate('country').populate('zone'); // Finds deployment target in the DB
		console.log(`${unit.name} is attempting to do recon in ${target.name}`);
		// Mechanics: Allows a mobilized military unit to produce intel on things in the site they are currently in.
		// Generates INTEL on the SITE automatically
		

		const units = await Military.find({ site: target._id, team: { $ne: this.team._id } }); // Finds all UNITS that don't belong to us.
		const facilities = await Facilities.find({ site: target._id, team: { $ne: this.team._id } }); // Finds all Facilities that don't belong to us.
		const squads = await Squads.find({ site: target._id, team: { $ne: this.team._id } }); // Finds all Squads at the site that don't belong to us.

		for (const item of [...units, ...facilities, ...squads]) {
			// Options
		}
		// TODO - Create algorytmic method to translate a RECON stat to actual INTEL
		for (let i; i < this.stats.recon; i++) {
			console.log('Attempting to generate INTEL');
		}
	}
	catch (err) {
		throw err;
	}
};

// Method - Repair
// IN: VOID | OUT: VOID
// PROCESS: Repairs units health (Does it repair upgrades?)
MilitarySchema.methods.repair = async function (upgrades = []) {
	await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present
	try {
		// Mechanics: Repairs damage to a military unit when they are at a facility with repair capabilities.
		const cost = 1 + upgrades.length;
		const account = await Account.findOne({ name: 'Operations', team: this.team }); // Finds the operations account for the owner of the UNIT
		await account.spend({ amount: cost, note: `Repairing ${this.name} and ${upgrades.length} upgrades`, resource: 'Megabucks' }); // Attempt to spend the money to go

		this.stats.health = this.stats.healthMax; // Restores the units health to max

		for (const item of upgrades) {
			const upgrade = await Upgrade.findById(item);
			// upgrade.repair() // Call repair method of upgrade | TODO - Make repair method of upgrade
			console.log(`${upgrade.name} has been repaired while equiped to ${this.name}`);
		}

		const unit = await this.save(); // Saves the unit into a new variable
		nexusEvent.emit('request', 'update', [ unit ]); // Updates the front-end
		return unit;
	}
	catch (err) {
		throw err;
	}
};

MilitarySchema.methods.upgrade = async function (upgradesAdd = [], upgradesRemove = []) {
	await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present
	// TODO add the mechanics of adding things to the UNIT
	// Mechanics: Changes out existing upgrades with anything currently stored.
	try {
		let unit = this;
		upgradesRemove.length > 0 ? await unit.unequip(upgradesRemove) : undefined;
		upgradesAdd.length > 0 ? await unit.equip(upgradesAdd) : undefined;
		return unit;
	}
	catch (err) {
		throw err;
	}
};

// Method - Equip
// IN: VOID | OUT: VOID
// PROCESS: Changes the equipment of the unit
MilitarySchema.methods.equip = async function (upgrades = []) {
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
MilitarySchema.methods.unequip = async function (upgrades = []) {
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

// Method - Aid
// IN: VOID | OUT: VOID
// PROCESS: Changes the equipment of the unit
MilitarySchema.methods.aid = async function (site) {
	await this.takeAction(); // Attempts to use action, uses mission if no action, errors if neither is present

	try {
		let unit = this;
		if (unit.site._id.toString() !== site) unit = await unit.deploy(site);

		const target = await Site.findById(site).populate('country').populate('zone'); // Finds deployment target in the DB
		console.log(`${unit.name} is attempting aid the population of ${target.name}`);
		// TODO - Add in something for aid to actually effect
		// Mechanics: Give assistance to the local populace of the site reducing the effects of a crisis event and increasing loyalty
	}
	catch (err) {
		throw err;
	}
};

// METHOD - takeAction
// IN: VOID | OUT: VOID
// PROCESS: Expends mission/action pts or errors if there are none
MilitarySchema.methods.takeAction = async function () {
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

// METHOD - endTurn
// IN - VOID | OUT: VOID
// PROCESS: Standard WTS method for end of turn maintanance for the military object
MilitarySchema.methods.endTurn = async function () {
	// Activate mission
	// Document mission

	// Reset UNIT
	this.actions = 1;
	this.missions = 1;

	if (this.status.some(el => el === 'recall')) await this.recall(true); // Recalls the unit to home base if nessesary.
	await this.save();
};

MilitarySchema.methods.report = async function (action, type) {
	const { repair, transfer, cost } = action;
	try {
		let report = new MilitaryAction ({
			team: this.team,
			aircraft: this._id,
			// site: this.site._id,
			type,
			repair,
			transfer,
			cost
		});

		await report.createTimestamp();

		// const MilitaryAction = Report.discriminator('MilitaryAction', new Schema({
		// 	type: { type: String, required: true, enum: ['Deploy', 'Repair', 'Transfer'] },
		// 	units: [{ type: Schema.Types.ObjectId, ref: 'Military' }],
		// 	cost: { type: Number },
		// 	dmgRepaired: { type: Number, default: 0 }
		// }));

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

MilitarySchema.methods.populateMe = async function () {
	return this.populate('team', 'name shortName code')
		.populate('zone', 'name')
		.populate('organization', 'name')
		.populate('site', 'name geoDecimal')
		.populate('origin')
		.populate('upgrades', 'name effects')
		.execPopulate();
};

MilitarySchema.methods.validateMilitary = async function () {
	const { validTeam, validZone, validOrganization, validSite, validFacility, validUpgrade, validLog } = require('../middleware/util/validateDocument');
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		status: Joi.array().items(Joi.string().valid('damaged', 'deployed', 'destroyed', 'repair', 'mobilized', 'operational', 'action', 'mission')),
		tags: Joi.array().items(Joi.string().valid('secret'))
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validSite(this.site);
	await validTeam(this.team);
	await validZone(this.zone);
	await validOrganization(this.organization);
	await validFacility(this.origin);
	for await (const upg of this.upgrades) {
		await validUpgrade(upg);
	}
	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
	}
};


const Military = mongoose.model('Military', MilitarySchema);

const Fleet = Military.discriminator(
	'Fleet',
	new Schema({
		type: { type: String, default: 'Fleet' },
		stats: {
			health: { type: Number, default: 4 },
			healthMax: { type: Number, default: 4 },
			attack: { type: Number, default: 0 },
			defense: { type: Number, default: 2 },
			recon: { type: Number, default: 1 },
			localDeploy: { type: Number, default: 2 },
			globalDeploy: { type: Number, default: 4 },
			range: { type: Number, default: 5000 }
		}
	})
);

const Corps = Military.discriminator(
	'Corps',
	new Schema({
		type: { type: String, default: 'Corps' },
		stats: {
			health: { type: Number, default: 2 },
			healthMax: { type: Number, default: 2 },
			attack: { type: Number, default: 0 },
			defense: { type: Number, default: 2 },
			localDeploy: { type: Number, default: 2 },
			globalDeploy: { type: Number, default: 5 },
			range: { type: Number, default: 2000 }
		}
	})
);

module.exports = { Military, Fleet, Corps };