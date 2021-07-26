const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const TransactionLog = Log.discriminator('TransactionLog', new Schema({
	type: { type: String, default: 'Transaction' },
	transaction: { type: String, enum: ['Deposit', 'Withdrawal'] },
	counterparty: { type: Schema.Types.ObjectId, ref: 'Account' },
	account: { type: String, required: true },
	amount: { type: Number, required: true },
	note: { type: String }
}));

module.exports = TransactionLog;