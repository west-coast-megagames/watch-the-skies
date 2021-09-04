const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const nexusError = require('../../middleware/util/throwError'); // Costom error handler util

const Schema = mongoose.Schema;

const LogSchema = new Schema({
	date: { type: Date },
	timestamp: { type: Schema.Types.Mixed },
	model: { type: String, default: 'Log', minlength: 1, maxlength: 3, required: true },
	team: { type: Schema.Types.ObjectId, ref: 'Team' },
	site: { type: Schema.Types.ObjectId, ref: 'Site' },
	organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' }
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

LogSchema.methods.validateLog = async function () {
	const schema = Joi.object({
		model: Joi.string().min(1).max(3)
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

};

const Log = mongoose.model('Log', LogSchema);

const TerrorLog = Log.discriminator('TerrorLog', new Schema({
	type: { type: String, default: 'Terror' },

	targetSite: { type: Schema.Types.ObjectId, ref: 'Site' },
	startTerror: { type: Number },
	addTerror: { type: Number },
	endTerror: { type: Number },
	terrorMessage: { type: String }
}));

const TransportLog = Log.discriminator('TransportLog', new Schema({
	type: { type: String, default: 'Transport' },
	unit: { type: Schema.Types.ObjectId, ref: 'Aircraft' },
	report: { type: String, required: true }
}));

module.exports = { Log, TerrorLog, TransportLog };