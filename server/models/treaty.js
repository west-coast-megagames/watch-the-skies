const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID
const Gameclock = require('../wts/gameClock/gameClock');

const ActivitySchema = new Schema({
	header: { type: String, default: 'Treaty Event' },
	date: { type: Date },
	timestamp: { type: Schema.Types.Mixed },
	data: [Schema.Types.Mixed]
});

const TreatySchema = new Schema({
	model: { type: String, default: 'Treaty' },
	name: { type: String, default: 'Treaty Event', minlength: 2, maxlength: 50, required: true },
	cost: { type: Number, default: 0 },
	creator: { type: ObjectId, ref: 'Team' },
	authors: [{ type: ObjectId, ref: 'Team' }], // teams that have the ability to edit
	witness: [{ type: ObjectId, ref: 'Team' }], // teams that can view treaty
	excluded: [{ type: ObjectId, ref: 'Team' }], // teams that cannot approve/become signitories.
	signatories: [{ type: ObjectId, ref: 'Team' }],
	expiration: { type: Schema.Types.Mixed },
	alliances: [{ type: Schema.Types.Mixed }], // update with alliance schema which is coming... soonish
	clauses: { type: String },
	violation: { type: String },
	activityFeed: [ActivitySchema],
	lastUpdated: { type: Date, default: Date.now() },
	tags: [{ type: String, enum: [''] } ],
	status: [ { type: String, enum: ['draft', 'proposal', 'rejected', 'complete', 'deleted'] } ],
});

// validateTreaty method
TreatySchema.methods.validateTreaty = async function () {
	const { validTeam } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		tags: Joi.array().items(Joi.string().valid('')),
		status: Joi.array().items(Joi.string().valid('draft', 'proposal', 'rejected', 'complete', 'deleted'))

		// TODO: Add code rules to Joi validation schema
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.creator);
	for await (const auths of this.authors) {
		await validTeam(auths);
	}
	for await (const wits of this.witness) {
		await validTeam(wits);
	}
	for await (const excl of this.excluded) {
		await validTeam(excl);
	}
	for await (const sigs of this.signatories) {
		await validTeam(sigs);
	}
};

TreatySchema.methods.saveActivity = async (treaty, incHeader) => {
	const activity = {
		header: incHeader,
		date: new Date(),
		timestamp: Gameclock.getTimeStamp()
	};

	treaty.activityFeed.push(activity);
	treaty = await treaty.save();
	return treaty;
};

const Treaty = mongoose.model('Treaty', TreatySchema);

module.exports = { Treaty };