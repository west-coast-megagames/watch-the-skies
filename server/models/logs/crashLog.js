const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const CrashLog = Log.discriminator('CrashLog', new Schema({
    logType: { type: String, default: 'Crash' },
    country: { type: Schema.Types.ObjectId, ref: 'Country'},
    site: { type: Schema.Types.ObjectId, ref: 'Site'},
    zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
    salvage: { type: Schema.Types.ObjectId, ref: 'Upgrade'},
}));

module.exports = CrashLog;