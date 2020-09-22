const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const TheoryLog = Log.discriminator('TheoryLog', new Schema({
	logType: { type: String, default: 'Theory' },
	lab: { type: Schema.Types.ObjectId, ref: 'Facility' },
	theory: { type: Schema.Types.ObjectId, ref: 'Research' }
}));

module.exports = TheoryLog;