const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const DeployLog = Log.discriminator('DeployLog', new Schema({
    logType: { type: String, default: 'Deploy' },
    country: { type: Schema.Types.ObjectId, ref: 'Country'},
    site: { type: Schema.Types.ObjectId, ref: 'Site'},
    zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
    units: [{type: Schema.Types.ObjectId, ref: 'Military'}],
    cost: { type: Number }
}));

module.exports = DeployLog;