const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const TransactionLog = Log.discriminator('TransactionLog', new Schema({
    logType: { type: String, default: 'Transaction' },
    transaction: { type: String, enum: ['Deposit', 'Withdrawal']},
    account: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String }
}));

module.exports = TransactionLog;