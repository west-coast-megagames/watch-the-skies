const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

const Schema = mongoose.Schema;

const ZoneSchema = new Schema({
	model: { type: String, default: 'Zone' },
	code: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 2,
		uppercase: true,
		index: true,
		unique: true
	},
	name: { type: String, required: true, minlength: 3, maxlength: 50 },
	tags: [{ type: String, enum: [''] } ],
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }]
}, { timestamps: true });

// validateZone Method
ZoneSchema.methods.validateZone = async function () {
	const { validLog } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);

	// Descrininator Validation Schema switch
	let schema = {};
	switch (this.type) {
	case 'Ground':
		schema = Joi.object({
			code: Joi.string().min(2).max(2).required().uppercase(),
			name: Joi.string().min(3).max(50).required(),
			tags: Joi.array().items(Joi.string().valid('')),
			terror: Joi.number().min(0).max(250)
		});

		break;

	case 'Space':
		schema = Joi.object({
			code: Joi.string().min(2).max(2).required().uppercase(),
			name: Joi.string().min(3).max(50).required(),
			tags: Joi.array().items(Joi.string().valid(''))
		});
		break;

	default:
		nexusError(`Invalid Type ${this.type} for zone!`, 400);
	}

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
	}
};

const Zone = mongoose.model('Zone', ZoneSchema);

const GroundZone = Zone.discriminator(
	'GroundZone',
	new Schema({
		type: { type: String, default: 'Ground' },
		terror: {
			type: Number,
			min: 0,
			max: 250,
			default: 0
		}
	})
);

const SpaceZone = Zone.discriminator(
	'SpaceZone',
	new Schema({
		type: { type: String, default: 'Space' }
	})
);

module.exports = {
	Zone,
	GroundZone,
	SpaceZone
};
