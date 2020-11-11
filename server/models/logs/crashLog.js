const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const CrashLog = Log.discriminator('CrashLog', new Schema({
	type: { type: String, default: 'Crash' },
	salvage: [{ type: String }] // type: Schema.Types.ObjectId, ref: 'Upgrade'

}));

module.exports = CrashLog;