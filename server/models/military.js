const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID
const { Facility } = require('./facility'); // Import of Facility model [Mongoose]
const { Account } = require('./account'); // Import of Account model [Mongoose]
const { Site } = require('./site'); // Import of Site model [Mongoose]

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
		type: { type: String, default: 'Garrison', enum: ['Attack', 'Siege', 'Terrorize', 'Raze', 'Humanitarian', 'Garrison']}
	},
	hidden: { type: Boolean, default: false },
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	location: {
		lat: { type: Number },
		lng: { type: Number }
	},
	status: {
		type: [String],
		enum: ['damaged', 'deployed', 'destroyed', 'repairing', 'mobilized', 'operational']
	},
	tags: { 
		type: [String],
		enum: ['secret']
	}
});

// METHOD - Mission
// IN - Mission Object { target, type } | OUT: VOID
// PROCESS: Checks to see if the UNIT is able to go on the mission, pays the cost.
MilitarySchema.methods.mission = async function (assignment) {
	if (!this.status.some(el => el === 'mobilized')) throw new Error(`${this.name} is not mobilized.`) // Checks if the UNIT is mobalized
	if (this.missions < 1) throw new Error(`${this.name} cannot deploy for another mission this turn.`); // Checks if the UNIT has a mission availible

	try {
		this.missions -= 1; // Reduces the availible missions by 1
		if (this.site._id.toString() !== assignment.target) this = await this.deploy(assignment.target);

		this.assignment = assignment;

		await this.save();
		
		// TODO - Add populate & socket update

		return this;
	} catch (error) {
		console.log(error);
	}
};

// METHOD - Deploy
// IN: Site _id | OUT: VOID
// PROCESS: Deploys a UNIT to a site.
MilitarySchema.methods.deploy = async function(site) {
	logger.info(`Deploying ${this.name} to ${target.name} in the ${target.zone.name} zone`);
	const target = await Site.findById(site).populate('country').populate('zone'); // Finds deployment target in the DB
	try {
		let cost = 0;
		let distance = getDistance(this.location.latDecimal, this.location.longDecimal, target.geoDecimal.latDecimal, target.geoDecimal.longDecimal); // Get distance to target in KM
		if (distance > this.range * 4) throw new Error(`${target.name} is beyond the deployment range of ${this.name}.`); // Error for beyond operational range
		else if (distance > this.range) cost = this.stats.globalDeploy;
		else if (distance > 0) cost = this.stats.localDeploy;

		if (!this.status.some(el => el === 'deployed')) { 
			this.status.push('deployed');
			this.markModified('status');
		}

		const account = await Account.find({ name: 'Operations', 'team': this.team }); // Finds the operations account for the owner of the UNIT
		await account.spend({ amount: cost, note: `${this.name} deployed to ${target.name} for ${mission.type}`, resource: 'Megabucks' }); // Attempt to spend the money to go

		await account.save();
		await this.save();

		// TODO - Add populate & socket update
		return this;
	}
	catch (err) {
		logger.info('Error:', err.message);
		logger.error(`Catch Military Model deploy Error: ${err.message}`, {
			meta: err
		});
	}
};

MilitarySchema.methods.validateMilitary = async function () {
	const { validTeam, validZone, validOrganization, validSite, validFacility, validUpgrade, validLog } = require('../middleware/util/validateDocument');
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required()
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

// Recall method - Returns the craft to origin
MilitarySchema.methods.recall = async function () {
	logger.info(`Recalling ${this.name} to base...`);

	try {
		const { origin } = this;
		const home = await Facility.findById(origin)
			.populate('site');

		this.status.deployed = false;
		this.location = randomCords(home.site.geoDecimal.lat, home.site.geoDecimal.lng);
		this.site = home.site;
		this.organization = home.site.organization;
		this.zone = home.site.zone;

		this.status.action = true;
		this.status.mission = true;

		const aircraft = await this.save();
		logger.info(`${this.name} returned to ${home.name}...`);

		return aircraft;
	}
	catch (err) {
		nexusError(`${err.message}`, 500);
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
			localDeploy: { type: Number, default: 2 },
			globalDeploy: { type: Number, default: 5 },
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

module.exports = {
	Military, Fleet, Corps
};
