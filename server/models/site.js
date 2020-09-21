const mongoose = require('mongoose');
const Joi = require('joi');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const SiteSchema = new Schema({
	model: { type: String, default: 'Site' },
	name: { type: String, required: true, minlength: 2, maxlength: 50 },
	team: { type: ObjectId, ref: 'Team' },
	country: { type: ObjectId, ref: 'Country' },
	zone: { type: ObjectId, ref: 'Zone' },
	siteCode: {
		type: String,
		minlength: 2,
		maxlength: 20,
		required: true,
		unique: true
	},
	hidden: { type: Boolean, default: false }, // just in case and to be consistent
	facilities: [{ type: ObjectId, ref: 'Facility' }],
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	gameState: []
});

const Site = mongoose.model('Site', SiteSchema);

SiteSchema.methods.validateSite = function (site) {
	const schema = {
		name: Joi.string().min(2).max(50).required(),
		siteCode: Joi.string().min(2).max(20).required()
	};

	return Joi.validate(baseSite, schema, { allowUnknown: true });
};

function validateSite (site) {
	// modelDebugger(`Validating ${site.siteCode}...`);

	const schema = {
		name: Joi.string().min(2).max(50).required(),
		siteCode: Joi.string().min(2).max(20).required()
	};

	return Joi.validate(site, schema, { allowUnknown: true });
}

const GroundSite = Site.discriminator(
	'GroundSite',
	new Schema({
		type: { type: String, default: 'Ground' },
		subType: { type: String, default: 'City', enum: ['City', 'Crash'] },
		geoDMS: {
			latDMS: { type: String, minlength: 7, maxlength: 13 }, // format DD MM SS.S N or S  example  40 44 55.02 N
			longDMS: { type: String, minlength: 7, maxlength: 14 } // format DDD MM SS.S E or W example 073 59 11.02 W
		},
		geoDecimal: {
			latDecimal: { type: Number, min: -90, max: 90 }, // Positive is North, Negative is South
			longDecimal: { type: Number, min: -180, max: 180 } // Postive is East, Negative is West
		},
		coastal: {
			type: Boolean,
			default: false
		},
		dateline: { type: String, default: 'Dateline' },
		salvage: [{ type: ObjectId, ref: 'System' }],
		status: {
			public: { type: Boolean, default: false },
			secret: { type: Boolean, default: false }
		}
	})
);

function validateGround (groundSite) {
	const schema = {
		name: Joi.string().min(2).max(50).required(),
		siteCode: Joi.string().min(2).max(20).required()
	};

	return Joi.validate(groundSite, schema, { allowUnknown: true });
}

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
		status: {
			damaged: { type: Boolean, default: false },
			destroyed: { type: Boolean, default: false },
			upgrade: { type: Boolean, default: false },
			repair: { type: Boolean, default: false },
			secret: { type: Boolean }
		}
	})
);

function validateSpace (spaceSite) {
	const schema = {
		name: Joi.string().min(2).max(50).required(),
		siteCode: Joi.string().min(2).max(20).required()
	};

	return Joi.validate(spaceSite, schema, { allowUnknown: true });
}

module.exports = {
	Site,
	validateSite,
	GroundSite,
	validateGround,
	SpaceSite,
	validateSpace
};
