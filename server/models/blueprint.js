const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const BlueprintSchema = new Schema({
	model: { type: String, default: 'Blueprint' },
	name: { type: String, min: 2, maxlength: 50, required: true, unique: true },
	code: { type: String, minlength: 2, maxlength: 20, required: true, unique: true },
	cost: { type: Number, default: 0 },
	buildTime: { type: Number, default: 0 },
	desc: { type: String, min: 1, maxlength: 255, default: 'Blueprint' },
	prereq: [],
	hidden: { type: Boolean, default: false },
	tags: [{ type: String, enum: [''] } ]
});

// validateBlueprint method
BlueprintSchema.methods.validateBlueprint = async function () {
	const { validSite } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);

	// Descrininator Validation Schema switch
	let schema = {};
	switch (this.buildModel) {
	case 'aircraft':

		schema = Joi.object({
			code: Joi.string() .min(2) .max(20) .required() .uppercase(),
			name: Joi.string() .min(2) .max(50) .required(),
			cost: Joi.number() .min(0) .required(),
			buildTime: Joi.number() .min(0) .required(),
			desc: Joi.string() .min(1) .max(255) .required(),
			buildModel: Joi.string() .min(1) .required(),
			tags: Joi.array().items(Joi.string().valid(''))
		});
		break;

	case 'building':
		schema = Joi.object({
			code: Joi.string().min(2).max(20).required().uppercase(),
			name: Joi.string().min(2).max(50).required(),
			cost: Joi.number().min(0).required(),
			buildTime: Joi.number().min(0).required(),
			desc: Joi.string().min(1).max(255).required(),
			buildModel: Joi.string() .min(1) .required()
		});
		break;

	case 'facility':
		schema = Joi.object({
			code: Joi.string().min(2).max(20).required().uppercase(),
			name: Joi.string().min(2).max(50).required(),
			cost: Joi.number().min(0).required(),
			buildTime: Joi.number().min(0).required(),
			desc: Joi.string().min(1).max(255).required(),
			buildModel: Joi.string() .min(1) .required(),
			status: Joi.array().items(Joi.string().valid('secret', ''))
		});
		break;

	case 'squad':
		schema = Joi.object({
			code: Joi.string().min(2).max(20).required().uppercase(),
			name: Joi.string().min(2).max(50).required(),
			cost: Joi.number().min(0).required(),
			buildTime: Joi.number().min(0).required(),
			desc: Joi.string().min(1).max(255).required(),
			buildModel: Joi.string() .min(1) .required()
		});
		break;

	case 'military':
		schema = Joi.object({
			code: Joi.string().min(2).max(20).required().uppercase(),
			name: Joi.string().min(2).max(50).required(),
			cost: Joi.number().min(0).required(),
			buildTime: Joi.number().min(0).required(),
			desc: Joi.string().min(1).max(255).required(),
			buildModel: Joi.string() .min(1) .required()
		});
		break;

	case 'upgrade':
		schema = Joi.object({
			code: Joi.string().min(2).max(20).required().uppercase(),
			name: Joi.string().min(2).max(50).required(),
			cost: Joi.number().min(0).required(),
			buildTime: Joi.number().min(0).required(),
			desc: Joi.string().min(1).max(255).required(),
			buildModel: Joi.string() .min(1) .required(),
			status: Joi.array().items(Joi.string().valid('building', 'salvage', 'damaged', 'destroyed', 'storage'))
		});
		break;

	default:
		nexusError(`Invalid buildModel ${this.buildModel} for Blueprint!`, 400);
	}

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	if (this.site) {
		await validSite(this.site);
	}

	if (this.isNew) {
		let doc = await Blueprint.findOne({ code: this.code });
		if (doc != null) nexusError(`A blueprint with code ${this.code} exists. code must be unique.`, 400);

		doc = await Blueprint.findOne({ name: this.name });
		if (doc != null) nexusError(`A blueprint with name ${this.name} exists. name must be unique.`, 400);
	}
};

const Blueprint = mongoose.model('Blueprint', BlueprintSchema); // Creation of Blueprint Model

const FacilityBlueprint = Blueprint.discriminator(
	'FacilityBlueprint',
	new Schema({
		buildModel: { type: String, required: true, default: 'facility' },
		type: { type: String },
		site: { type: ObjectId, ref: 'Site' },
		buildings: [ { type: String }],
		status: [ { type: String, enum:  ['secret', ''] } ],
		unitType: [{ type: String, min: 2, maxlength: 50 }]
	})
);

const AircraftBlueprint = Blueprint.discriminator(
	'AircraftBlueprint',
	new Schema({
		buildModel: { type: String, required: true, default: 'aircraft' },
		stats: { type: Schema.Types.Mixed },
		type: { type: Schema.Types.String },
		upgrades: [Schema.Types.Mixed]
	})
);

const SquadBlueprint = Blueprint.discriminator(
	'SquadBlueprint',
	new Schema({
		buildModel: { type: String, required: true, default: 'squad' },
		stats: { type: Schema.Types.Mixed },
		type: { type: Schema.Types.String },
		upgrades: [Schema.Types.Mixed]
	})
);

const MilitaryBlueprint = Blueprint.discriminator(
	'MilitaryBlueprint',
	new Schema({
		buildModel: { type: String, required: true, default: 'military' },
		stats: { type: Schema.Types.Mixed },
		type: { type: Schema.Types.String },
		upgrades: [Schema.Types.Mixed]
	})
);

const UpgradeBlueprint = Blueprint.discriminator(
	'UpgradeBlueprint',
	new Schema({
		buildModel: { type: String, required: true, default: 'upgrade' },
		unitType: [{ type: String, min: 2, maxlength: 50 }],
		status: [ { type: String, enum:  ['building', 'salvage', 'damaged', 'destroyed', 'storage'] } ],
		effects: [ Schema.Types.Mixed	]
	})
);

const BuildingBlueprint = Blueprint.discriminator(
	'Buildinglueprint',
	new Schema({
		buildModel: { type: String, required: true, default: 'building' },
		type: { type: String },
		stats: { type: Schema.Types.Mixed }
	})
);

module.exports = { Blueprint, FacilityBlueprint, AircraftBlueprint, SquadBlueprint, UpgradeBlueprint, MilitaryBlueprint, BuildingBlueprint };