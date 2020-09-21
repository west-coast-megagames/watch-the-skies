const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
const validateObjectId = require('../middleware/util/validateObjectId');

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
	balance: { type: Number, default: 0 },
	deposits: [Number],
	withdrawals: [Number],
	autoTransfers: [TransferSchema],
	gameState: []
});

AccountSchema.methods.validate = function () {
	if (this.team === undefined) throw new Error('No team ID given!')
	if (!mongoose.Types.ObjectId.isValid(this.team)) throw { type: 'User Error', message: `${this.team} is not a valid id!`}

	const schema = {
		name: Joi.string().min(2).max(50).required(),
		code: Joi.string().min(3).max(3).required().uppercase()
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) throw { type: 'User Error', message: `${error}` };

	
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
