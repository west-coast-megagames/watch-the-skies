const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Gameclock = require('../wts/gameClock/gameClock');

const ActivitySchema = new Schema({
	header: { type: String, default: 'Treaty Event' },
	date: { type: Date },
	timestamp: { type: Schema.Types.Mixed },
	data: [Schema.Types.Mixed]
});

const TreatySchema = new Schema({
	name: { type: String, default: 'Treaty Event' },
	cost: { type: Number, default: 0 },
	creator: { type: Schema.Types.ObjectId, ref: 'Team' },
	authors: [{ type: Schema.Types.ObjectId, ref: 'Team' }], // teams that have the ability to edit
	witness: [{ type: Schema.Types.ObjectId, ref: 'Team' }], // teams that can view treaty
	excluded: [{ type: Schema.Types.ObjectId, ref: 'Team' }], // teams that cannot approve/become signitories.
	signatories: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
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