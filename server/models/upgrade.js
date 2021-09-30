const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const UpgradeSchema = new Schema({
	model: { type: String, default: 'Upgrade' },
	name: { type: String, required: true, min: 2, maxlength: 50 },
	code: { type: String },
	team: { type: ObjectId, ref: 'Team' },
	facility: { type: ObjectId, ref: 'Facility' },
	manufacturer: { type: ObjectId, ref: 'Team' },
	cost: { type: Number },
	buildTime: { type: Number, default: 0 },
	buildCount: { type: Number, default: 0 },
	desc: { type: String },
	prereq: [
		{
			type: { type: String },
			code: { type: String }
		}
	],
	status: {
		building: { type: Boolean, default: true },
		salvage: { type: Boolean, default: false },
		damaged: { type: Boolean, default: false },
		destroyed: { type: Boolean, default: false },
		storage: { type: Boolean, default: true }
	},
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	tags: [{ type: String, enum: ['']} ],
	effects: [
		{
			type: { type: String },
			effect: { type: Number }
		}
	]
});

// validateUpgrade method
UpgradeSchema.methods.validateUpgrade = async function () {
	const { validTeam, validLog } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);

	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		tags: Joi.array().items(Joi.string().valid(''))
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.team);
	await validTeam(this.manufacturer);
	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
	}

};

const Upgrade = mongoose.model('Upgrade', UpgradeSchema);

module.exports = { Upgrade };
