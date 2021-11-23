const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const DeployLog = Log.discriminator('DeployLog', new Schema({
	type: { type: String, default: 'Deploy' },
	organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
	site: { type: Schema.Types.ObjectId, ref: 'Site' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	units: [{ type: Schema.Types.ObjectId, ref: 'Military' }],
	cost: { type: Number }
}));

module.exports = DeployLog;