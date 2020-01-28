const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:AccountModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const TransferSchema = new Schema({
    to: { type: String },
    from: { type: String },
    amount: { type: Number },
    note: { type: String }
  })

const AccountSchema = new Schema({
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  owner: { type: String },
  name: { type: String },
  code: { type: String },
  balance: { type: Number },
  deposits: [Number],
  withdrawals: [Number],
  autoTransfers: [TransferSchema]
});

AccountSchema.methods.validateAccount = function (account) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    code: Joi.string().min(3).max(3).required().uppercase()
  };

  return Joi.validate(account, schema, { "allowUnknown": true });
}

let Account = mongoose.model('account', AccountSchema);

function validateAccount(account) {
  modelDebugger(`Validating ${account.name}...`);

  const schema = {
      code: Joi.string().min(3).max(3).required().uppercase(),
      name: Joi.string().min(2).max(50).required()
    };
  
  return Joi.validate(account, schema, { "allowUnknown": true });
};

module.exports = { Account, validateAccount }