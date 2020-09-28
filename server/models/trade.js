const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { validTeam } = require('../middleware/util/validateDocument');

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID
const Gameclock = require('../wts/gameClock/gameClock');

const ActivitySchema = new Schema({
	header: { type: String, default: 'Trade Event' },
	date: { type: Date },
	timestamp: { type: Schema.Types.Mixed },
	data: [Schema.Types.Mixed]
});

const TradeSchema = new Schema({
	initiator: {
		team: { type: ObjectId, ref: 'Team' },
		ratified: { type: Boolean, default: false },
		modified: { type: Boolean, default: false },
		offer: {
			megabucks: { type: Number, default: 0 },
			aircraft: [{ type: ObjectId, ref: 'Aircraft' }],
			// TODO: Add intel here
			research: [{ type: ObjectId, ref: 'Research' }],
			// TODO: Add sites here
			upgrade: [{ type: ObjectId, ref: 'Upgrade' }],
			comments: []
		} // initiator
	},
	tradePartner: {
		team: { type: ObjectId, ref: 'Team' },
		ratified: { type: Boolean, default: false },
		modified: { type: Boolean, default: false },
		offer: {
			megabucks: { type: Number, default: 0 },
			aircraft: [{ type: ObjectId, ref: 'Aircraft' }],
			// TODO: Add intel here
			research: [{ type: ObjectId, ref: 'Research' }],
			// TODO: Add sites here
			upgrade: [{ type: ObjectId, ref: 'Upgrade' }],
			comments: []
		} // tradePartner
	},
	status: {
		draft: { type: Boolean, default: true },
		proposal: { type: Boolean, default: false },
		pending: { type: Boolean, default: false },
		rejected: { type: Boolean, default: false },
		complete: { type: Boolean, default: false },
		deleted: { type: Boolean, default: false }
	},
	activityFeed: [ActivitySchema],
	lastUpdated: { type: Date, default: Date.now() }
});// const TradeSchema

// validateTrade method
TradeSchema.methods.validateTrade = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = {
		// TODO: Add trade rules to Joi validation schema
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.initiator.team);
	await validTeam(this.tradePartner.team);
};

TradeSchema.methods.saveActivity = async (trade, incHeader) => {
	const activity = {
		header: incHeader,
		date: new Date(),
		timestamp: Gameclock.makeTimestamp()
	};

	trade.activityFeed.push(activity);
	trade = await trade.save();
	return trade;
};

const Trade = mongoose.model('Trade', TradeSchema);

module.exports = { Trade };