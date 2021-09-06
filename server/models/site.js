const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { validTeam, validOrganization, validZone, validLog, validFacility, validUpgrade } = require('../middleware/util/validateDocument');

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const SiteSchema = new Schema({
	model: { type: String, default: 'Site' },
	name: { type: String, required: true, minlength: 2, maxlength: 50 },
	team: { type: ObjectId, ref: 'Team' },
	occupier: { type: ObjectId, ref: 'Team' },
	organization: { type: ObjectId, ref: 'Organization' },
	zone: { type: ObjectId, ref: 'Zone' },
	code: {
		type: String,
		minlength: 2,
		maxlength: 25,
		required: true,
		unique: true
	},
	hidden: { type: Boolean, default: false }, // just in case and to be consistent
	facilities: [{ type: ObjectId, ref: 'Facility' }],
	serviceRecord: [{ type: ObjectId, ref: 'Log' }]
});

// validateSite method
SiteSchema.methods.validateSite = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	let schema = {};
	let geoDMSSchema = {};
	let geoDecimalSchema = {};
	switch (this.type) {
	case 'Ground':
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			code: Joi.string().min(2).max(20).required(),
			subType: Joi.string().valid('City', 'Crash', 'Point of Interest'),
			tags: Joi.array().items(Joi.string().valid('coastal', 'capital')),
			status: Joi.array().items(Joi.string().valid('public', 'warzone', 'secret', 'occupied'))
		});

		geoDMSSchema = Joi.object({
			latDMS: Joi.string().min(7).max(13),
			longDMS: Joi.string().min(7).max(14)
		});

		geoDecimalSchema = Joi.object({
			latDecimal: Joi.number().min(-90).max(90),
			longDecimal: Joi.number().min(-180).max(180)
		});

		break;

	case 'Space':
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			code: Joi.string().min(2).max(20).required(),
			subType: Joi.string().valid('Satellite', 'Cruiser', 'Battleship', 'Hauler', 'Station'),
			status: Joi.array().items(Joi.string().valid('damaged', 'destroyed', 'upgrade', 'repair', 'secret'))
		});

		break;

	default:
		nexusError(`Invalid Type ${this.type} for zone!`, 400);
	}


	const mainCheck = schema.validate(this, { allowUnknown: true });
	if (mainCheck.error != undefined) nexusError(`${mainCheck.error}`, 400);

	await validTeam(this.team);
	await validOrganization(this.organization);
	await validZone(this.zone);
	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
	}
	for await (const fac of this.facilities) {
		await validFacility(fac);
	}
	if (this.type === 'Ground') {
		const geoDMSCheck = geoDMSSchema.validate(this.geoDMS, { allowUnknown: true });
		if (geoDMSCheck.error != undefined) nexusError(`${geoDMSCheck.error}`, 400);

		const geoDecimalCheck = geoDecimalSchema.validate(this.geoDecimal, { allowUnknown: true });
		if (geoDecimalCheck.error != undefined) nexusError(`${geoDecimalCheck.error}`, 400);

		for await (const salv of this.salvage) {
			await validUpgrade(salv);
		}
	}
};

const Site = mongoose.model('Site', SiteSchema);

const GroundSite = Site.discriminator(
	'GroundSite',
	new Schema({
		type: { type: String, default: 'Ground' },
		subType: { type: String, default: 'City', enum: ['City', 'Crash', 'Point of Interest'] },
		unrest: { type: Number, min: 0, max: 100, default: 25 },
		loyalty: { type: Number, min: 0, max: 100, default: 85 },
		repression: { type: Number, min: 0, max: 100, default: 0 },
		morale: { type: Number, min: 0, max: 100, default: 50 },
		geoDMS: {
			latDMS: { type: String, minlength: 7, maxlength: 13 }, // format DD MM SS.S N or S  example  40 44 55.02 N
			longDMS: { type: String, minlength: 7, maxlength: 14 } // format DDD MM SS.S E or W example 073 59 11.02 W
		},
		geoDecimal: {
			latDecimal: { type: Number, min: -90, max: 90 }, // Positive is North, Negative is South
			longDecimal: { type: Number, min: -180, max: 180 } // Postive is East, Negative is West
		},
		tags: [{ type: String, enum: ['coastal', 'capital']} ],
		dateline: { type: String, default: 'Dateline' },
		salvage: [{ type: String }], // type: ObjectId, ref: 'Upgrade'
		status: [{ type: String, enum: ['public', 'warzone', 'secret', 'occupied']} ]
	})
);

const SpaceSite = Site.discriminator(
	'SpaceSite',
	new Schema({
		type: { type: String, default: 'Space' },
		subType: {
			type: String,
			required: true,
			min: 2,
			maxlength: 50,
			enum: ['Satellite', 'Cruiser', 'Battleship', 'Hauler', 'Station']
		},
		status: [ {type: String, enum: ['damaged', 'destroyed', 'upgrade', 'repair', 'secret']} ]
	})
);

module.exports = { Site, GroundSite, SpaceSite };