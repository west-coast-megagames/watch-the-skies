const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { validTeam, validZone, validLog, validCountry } = require('../middleware/util/validateDocument');

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema

// type are Terrestrial(earth) and Alien
const CountrySchema = new Schema({
	model: { type: String, default: 'Country' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	team: { type: Schema.Types.ObjectId, ref: 'Team' },
	code: {
		type: String,
		required: true,
		index: true,
		trim: true,
		unique: true,
		minlength: 2,
		maxlength: 2,
		uppercase: true
	},
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 3,
		maxlength: 75
	},
	unrest: {
		type: Number,
		min: 0,
		max: 250,
		default: 0
	},
	type: { type: String, default: 'Ground' },
	coastal: {
		type: Boolean,
		default: false
	},
	borderedBy: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
	milAlliance: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
	sciAlliance: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
	stats: {
		sciRate: { type: Number, default: 25 },
		balance: { type: Number, default: 0 }
	},
	formalName: { type: String },
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }],
	gameState: []
});

CountrySchema.methods.validateCountry = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = {
		name: Joi.string().min(3).max(75).required(),
		code: Joi.string().min(2).max(2).required().uppercase(),
		unrest: Joi.number().min(0).max(250)
	};

	// Descrininator Validation Schema switch
	switch (this.type) {
	case 'Ground':
		for await (const bBy of this.borderedBy) {
			await validCountry(bBy);
		}
		break;
	case 'Space':
		// nothing specific to test beyond type
		break;
	default:
		nexusError(`Invalid Type ${this.type} for country!`, 400);
	}
	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validZone(this.zone);
	await validTeam(this.team);
	for await (const milAll of this.milAlliance) {
		await validTeam(milAll);
	}
	for await (const sciAll of this.sciAlliance) {
		await validTeam(sciAll);
	}
	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
	}
};

const Country = mongoose.model('Country', CountrySchema);

module.exports = { Country };
