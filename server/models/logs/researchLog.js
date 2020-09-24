const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const ResearchLog = Log.discriminator('ResearchLog', new Schema({
	logType: { type: String, default: 'Research' },
	lab: { type: Schema.Types.ObjectId, ref: 'Facility' },
	project: { type: Schema.Types.ObjectId, ref: 'Research' },
	funding: { type: Number },
	stats: {
		sciRate: { type: Number },
		sciBonus: { type: Number },
		completed: { type: Boolean },
		breakthroughCount: { type: Number },
		finalMultiplyer: { type: Number }
	},
	progress: {
		startingProgress: { type: Number },
		endingProgress: { type: Number }

	},
	rolls: [Number],
	outcomes: [String]
}));

module.exports = ResearchLog;