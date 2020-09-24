const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module

const Schema = mongoose.Schema;

const LogSchema = new Schema({
	date: { type: Date },
	timestamp: { type: Schema.Types.Mixed },
	model: { type: String, default: 'Log' },
	team: { type: Schema.Types.ObjectId, ref: 'Team' }
});


LogSchema.methods.createTimestamp = (log) => {
	const Gameclock = require('../../wts/gameClock/gameClock');
	const { turn, phase, turnNum, minutes, seconds } = Gameclock.getTimeRemaining();
	log.timestamp = {
		turn,
		phase,
		turnNum,
		clock: `${minutes}:${seconds}`
	};

	return log;
};


const Log = mongoose.model('Log', LogSchema);

function validateLog (log) {
	// modelDebugger(`Validating ${site.siteCode}...`);

	const schema = {
		model: Joi.string().min(1).max(3)
	};

	return Joi.validate(log, schema, { 'allowUnknown': true });
}

const TerrorLog = Log.discriminator('TerrorLog', new Schema({
	logType: { type: String, default: 'Terror' },
	country: { type: Schema.Types.ObjectId, ref: 'Country' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	targetSite: { type: Schema.Types.ObjectId, ref: 'Site' },
	startTerror: { type: Number },
	addTerror: { type: Number },
	endTerror: { type: Number },
	terrorMessage: { type: String }
}));

module.exports = { Log, validateLog, TerrorLog };