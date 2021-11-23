const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const ReconLog = Log.discriminator('ReconLog', new Schema({
	type: { type: String, default: 'Recon' },
	organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
	targetSite: { type: Schema.Types.ObjectId, ref: 'Site' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	report: { type: String, required: true },
	rolls: [Number],
	unit: { type: Schema.Types.ObjectId, ref: 'Aircraft' },
	targetAircraft: { type: Schema.Types.ObjectId, ref: 'Aircraft' }
}));

module.exports = ReconLog;