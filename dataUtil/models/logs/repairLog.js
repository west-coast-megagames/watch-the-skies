const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const RepairLog = Log.discriminator('RepairLog', new Schema({
	logType: { type: String, default: 'Repair' },
	site: { type: Schema.Types.ObjectId, ref: 'Site' },
	aircraft: { type: Schema.Types.ObjectId, ref: 'Aircraft' },
	military: { type: Schema.Types.ObjectId, ref: 'Military' },
	facility: { type: Schema.Types.ObjectId, ref: 'facility' },
	dmgRepaired: { type: Number, default: 0 },
	cost: { type: Number, default: 0 }
}));

module.exports = RepairLog;