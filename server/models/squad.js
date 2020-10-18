const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const SquadSchema = new Schema({
	model: { type: String, default: 'Squad' },
	type: {
		type: String,
		default: 'Raid',
		enum: ['Raid', 'Assault', 'Infiltration', 'Envoy', 'Science']
	},
	rollBonus: { type: Number, required: true, default: 0 },
	upgrades: [{ type: ObjectId, ref: 'Upgrade' }],
	name: { type: String, required: true, min: 2, maxlength: 50, unique: true },
	team: { type: Schema.Types.ObjectId, ref: 'Team' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	country: { type: Schema.Types.ObjectId, ref: 'Country' },
	site: { type: Schema.Types.ObjectId, ref: 'Site' },
	origin: { type: Schema.Types.ObjectId, ref: 'Facility' },
	status: {
		damaged: { type: Boolean, default: false },
		deployed: { type: Boolean, default: false },
		destroyed: { type: Boolean, default: false },
		repair: { type: Boolean, default: false },
		secret: { type: Boolean, default: false }
	},
	gameState: []
});

// validateSquad Method
SquadSchema.methods.validateSquad = async function () {
	const { validTeam, validSite, validFacility, validCountry, validZone, validUpgrade } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		type: Joi.string().valid('Raid', 'Assault', 'Infiltration', 'Envoy', 'Science')
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validSite(this.site);
	await validTeam(this.team);
	await validCountry(this.country);
	await validZone(this.zone);
	await validFacility(this.origin);
	for (const upg of this.upgrades) {
		await validUpgrade(upg);
	}
};

const Squad = mongoose.model('Squad', SquadSchema);

module.exports = { Squad };
