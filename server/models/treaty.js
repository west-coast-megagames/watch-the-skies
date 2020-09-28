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
	name: { type: String, default: 'Treaty Event' },
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
	status: {
		draft: { type: Boolean, default: true },
		proposal: { type: Boolean, default: false },
		rejected: { type: Boolean, default: false },
		complete: { type: Boolean, default: false },
		deleted: { type: Boolean, default: false }
	}

});

// validateTreaty method
TreatySchema.methods.validateTreaty = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = {
		name: Joi.string().min(2).max(50).required()
		// TODO: Add code rules to Joi validation schema
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);
};

TreatySchema.methods.saveActivity = async (treaty, incHeader) => {
	const activity = {
		header: incHeader,
		date: new Date(),
		timestamp: Gameclock.makeTimestamp()
	};

	treaty.activityFeed.push(activity);
	treaty = await treaty.save();
	return treaty;
};

const Treaty = mongoose.model('Treaty', TreatySchema);

module.exports = { Treaty };