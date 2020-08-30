const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const TradeLog = Log.discriminator('TradeLog', new Schema({
    logType: { type: String, default: 'Trade' },
    trade: { type: Schema.Types.ObjectId, ref: 'Trade'}
}));

module.exports = TradeLog;