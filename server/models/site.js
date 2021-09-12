const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { validTeam, validOrganization, validZone, validLog, validFacility, validUpgrade } = require('../middleware/util/validateDocument');

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const FavorSchema = new Schema({
	team: {
		_id: { type: ObjectId, ref: 'Team', required: true },
		name: { type: String, required: true }
	},
	favor: { type: Number, default: 25, required: true },
	status: { type: String, enum:  ['occupier', 'liberator', ''] }
});

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
	let favorSchema = {};
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
			lngDMS: Joi.string().min(7).max(14)
		});

		geoDecimalSchema = Joi.object({
			lat: Joi.number().min(-90).max(90),
			lng: Joi.number().min(-180).max(180)
		});

		favorSchema = Joi.object({
		  team: Joi.object({
				name: Joi.string().required()
			}),
			favor: Joi.number(),
			status: Joi.string().valid('occupier', 'liberator', '')
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

		for await (const fav of this.favor) {
		  await validTeam(fav.team._id);

			// TODO: this is losing the team object somehow ... skip for now
			/*
			const favorCheck = favorSchema.validate(fav, { allowUnknown: true });
		  if (favorCheck.error != undefined) nexusError(`${favorCheck.error}`, 400);
      */
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
		favor: [FavorSchema],
		geoDMS: {
			latDMS: { type: String, minlength: 7, maxlength: 13 }, // format DD MM SS.S N or S  example  40 44 55.02 N
			lngDMS: { type: String, minlength: 7, maxlength: 14 } // format DDD MM SS.S E or W example 073 59 11.02 W
		},
		geoDecimal: {
			lat: { type: Number, min: -90, max: 90 }, // Positive is North, Negative is South
			lng: { type: Number, min: -180, max: 180 } // Postive is East, Negative is West
		},
		tags: [{ type: String, enum: ['coastal', 'capital']} ],
		dateline: { type: String, default: 'Dateline' },
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