const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:AccountModel');
const Schema = mongoose.Schema;

const TransferSchema = new Schema({
    to: { type: String },
    from: { type: String },
    amount: { type: Number },
    note: { type: String }
  })

const AccountSchema = new Schema({
  name: { type: String },
  code: { type: String },
  balance: { type: Number },
  deposits: [Number],
  withdrawls: [Number],
  autoTransfers: [TransferSchema]
});

let Account = mongoose.model('account', AccountSchema);

module.exports = { Account }