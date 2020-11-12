const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID
const { Facility } = require('./facility'); // Import of Facility model [Mongoose]
const randomCords = require('../util/systems/lz');

const MilitarySchema = new Schema({
	model: { type: String, default: 'Military' },
	name: { type: String, required: true, min: 2, maxlength: 50, unique: true },
	team: { type: ObjectId, ref: 'Team' },
	zone: { type: ObjectId, ref: 'Zone' },
	country: { type: ObjectId, ref: 'Country' },
	site: { type: ObjectId, ref: 'Site' },
	origin: { type: ObjectId, ref: 'Facility' },
	upgrades: [{ type: ObjectId, ref: 'Upgrade' }],
	status: {
		damaged: { type: Boolean, default: false },
		deployed: { type: Boolean, default: false },
		destroyed: { type: Boolean, default: false },
		repair: { type: Boolean, default: false },
		secret: { type: Boolean, default: false }
	},
	hidden: { type: Boolean, default: false },
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	gameState: []
});

MilitarySchema.methods.validateMilitary = async function () {
	const { validTeam, validZone, validCountry, validSite, validFacility, validUpgrade, validLog } = require('../middleware/util/validateDocument');
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required()
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validSite(this.site);
	await validTeam(this.team);
	await validZone(this.zone);
	await validCountry(this.country);
	await validFacility(this.origin);
	for await (const upg of this.upgrades) {
		await validUpgrade(upg);
	}
	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
	}
};


MilitarySchema.methods.deploy = async (unit, country) => {
	const banking = require('../../../wts/banking/banking');
	const { Account } = require('../../account');

	try {
		logger.info(
			`Deploying ${unit.name} to ${country.name} in the ${country.zone.name} zone`
		);
		let cost = 0;
		if (unit.zone !== country.zone) {
			cost = unit.status.localDeploy;
			unit.status.deployed = true;
		}
		else if (unit.zone === country.zone) {
			cost = unit.status.globalDeploy;
			unit.status.deployed = true;
		}

		let account = await Account.findOne({
			name: 'Operations',
			team: unit.team
		});
		account = await banking.withdrawal(
			account,
			cost,
			`Deploying ${
				unit.name
			} to ${country.name.toLowerCase()} in the ${country.zone.name.toLowerCase()} zone`
		);

		logger.info(account);
		await account.save();
		await unit.save();
		logger.info(`${unit.name} deployed...`);

		return unit;
	}
	catch (err) {
		logger.info('Error:', err.message);
		logger.error(`Catch Military Model deploy Error: ${err.message}`, {
			meta: err
		});
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
			invasion: { type: Number, default: 2 }
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
			invasion: { type: Number, default: 2 }
		}
	})
);

module.exports = { Military, Fleet, Corps };
