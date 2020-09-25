const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

// type are Terrestrial(earth) and Alien
const CountrySchema = new Schema({
	model: { type: String, default: 'Country' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	loadZoneCode: { type: String, maxlength: 2, uppercase: true },
	team: { type: Schema.Types.ObjectId, ref: 'Team' },
	loadTeamCode: { type: String, maxlength: 3 },
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

CountrySchema.methods.validateCountry = function () {
	const schema = {
		name: Joi.string().min(3).max(75).required(),
		code: Joi.string().min(2).max(2).required().uppercase(),
		unrest: Joi.number().min(0).max(250)
	};

	return Joi.validate(this, schema, { allowUnknown: true });
};

const Country = mongoose.model('Country', CountrySchema);

const GroundCountry = Country.discriminator(
	'GroundCountry',
	new Schema({
		type: { type: String, default: 'Ground' },
		coastal: {
			type: Boolean,
			default: false
		},
		borderedBy: [{ type: Schema.Types.ObjectId, ref: 'Country' }]
	})
);

const SpaceCountry = Country.discriminator(
	'SpaceCountry',
	new Schema({
		type: { type: String, default: 'Space' }
	})
);

module.exports = { Country, GroundCountry, SpaceCountry };
