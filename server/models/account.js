const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const TransferSchema = new Schema({
	to: { type: String },
	from: { type: String },
	amount: { type: Number },
	note: { type: String }
});

const AccountSchema = new Schema({
	model: { type: String, default: 'Account' },
	team: { type: Schema.Types.ObjectId, ref: 'Team', require },
	owner: { type: String },
	name: { type: String, require },
	code: { type: String },
	balance: { type: Number, require },
	deposits: [Number],
	withdrawals: [Number],
	autoTransfers: [TransferSchema],
	gameState: []
});

AccountSchema.methods.validateAccount = function (account) {
	const schema = {
		name: Joi.string().min(2).max(50).required(),
		code: Joi.string().min(3).max(3).required().uppercase()
	};
	return Joi.validate(account, schema, { allowUnknown: true });
};

const Account = mongoose.model('account', AccountSchema);

function validateAccount (account) {
	const schema = {
		code: Joi.string().min(3).max(3).required().uppercase(),
		name: Joi.string().min(2).max(50).required()
	};
	return Joi.validate(account, schema, { allowUnknown: true });
}

module.exports = { Account, validateAccount };
