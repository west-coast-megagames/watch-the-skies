const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID
const Gameclock = require('../wts/gameClock/gameClock');
const nexusEvent = require('../middleware/events/events');

const ActivitySchema = new Schema({
	header: { type: String, default: 'Trade Event' },
	date: { type: Date },
	timestamp: { type: Schema.Types.Mixed },
	data: [Schema.Types.Mixed]
});

const TradeSchema = new Schema({
	model: { type: String, default: 'Trade' },
	initiator: {
		team: { type: ObjectId, ref: 'Team' },
		ratified: { type: Boolean, default: false },
		modified: { type: Boolean, default: false },
		offer: {
			megabucks: { type: Number, default: 0 },
			aircraft: [{ type: Schema.Types.Mixed }],
			// TODO: Add intel here
			research: [{ type: ObjectId, ref: 'Research' }],
			// TODO: Add sites here
			upgrade: [{ type: ObjectId, ref: 'Upgrade' }],
			tags: [{ type: String, enum: [''] }],
			comments: { type: String, default: 'No Comments' }
		} // initiator
	},
	tradePartner: {
		team: { type: ObjectId, ref: 'Team' },
		ratified: { type: Boolean, default: false },
		modified: { type: Boolean, default: false },
		offer: {
			megabucks: { type: Number, default: 0 },
			aircraft: [{ type: Schema.Types.Mixed }],
			// TODO: Add intel here
			research: [{ type: ObjectId, ref: 'Research' }],
			// TODO: Add sites here
			upgrade: [{ type: ObjectId, ref: 'Upgrade' }],
			comments: { type: String, default: 'No Comments' }
		} // tradePartner
	},
	status: { type: String, default: 'Draft', enum: ['Draft', 'Rejected', 'Trashed', 'Completed' ] },
	activityFeed: [ActivitySchema],
	lastUpdated: { type: Date, default: Date.now() }
}, { timestamps: true });// const TradeSchema

// validateTrade method
TradeSchema.methods.validateTrade = async function () {
	const { validTeam, validAircraft, validUpgrade, validResearch } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		// TODO: Add trade rules to Joi validation schema
		tags: Joi.array().items(Joi.string().valid(''))
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.initiator.team);
	await validTeam(this.tradePartner.team);

	for await (const aircrft of this.tradePartner.offer.aircraft) {
		await validAircraft(aircrft);
	}
	for await (const aircrft2 of this.initiator.offer.aircraft) {
		await validAircraft(aircrft2);
	}
	for await (const upg1 of this.tradePartner.offer.upgrade) {
		await validUpgrade(upg1);
	}
	for await (const rsrch1 of this.tradePartner.offer.research) {
		await validResearch(rsrch1);
	}
	for await (const upg2 of this.initiator.offer.upgrade) {
		await validUpgrade(upg2);
	}
	for await (const rsrch2 of this.initiator.offer.research) {
		await validResearch(rsrch2);
	}

};

TradeSchema.methods.saveActivity = async (trade, incHeader) => {
	const activity = {
		header: incHeader,
		date: new Date(),
		timestamp: Gameclock.getTimeStamp()
	};

	trade.activityFeed.push(activity);
	trade = await trade.save();
	return trade;
};

TradeSchema.methods.editTrade = async (data) => {
	logger.info('Attempting to edit trade...');
	try {
		const { offer, editor } = data;

		this.initiator.team._id === editor ? this.initiator.offer = offer : this.tradePartner.offer = offer;
		this.initiator.ratified = false;
		this.tradePartner.ratified = false;

		const trade = await trade.save();
		await trade.populateMe();
		nexusEvent.emit('request', 'update', [ trade ]); //
	}
	catch (err) {
		if (err.status !== undefined) {
			nexusError(err.message, err.status);
		}
		else {
			nexusError(err.message, 500);
		}
	}
};


TradeSchema.methods.populateMe = function () {
	return this
		.populate('team', 'name shortName')
		.execPopulate();
};

const Trade = mongoose.model('Trade', TradeSchema);

module.exports = { Trade };