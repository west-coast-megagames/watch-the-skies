const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const ReconLog = Log.discriminator('ReconLog', new Schema({
    logType: { type: String, default: 'Recon' },
    country: { type: Schema.Types.ObjectId, ref: 'Country'},
    targetSite: { type: Schema.Types.ObjectId, ref: 'Site'},
    zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
    report: { type: String, required: true },
    rolls: [Number],
    unit: { type: Schema.Types.ObjectId, ref: 'Aircraft'},
    targetAircraft: { type: Schema.Types.ObjectId, ref: 'Aircraft'},
}));

module.exports = ReconLog;