const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const nexusError = require('../middleware/util/throwError');
const { Team } = require('./team');

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

AccountSchema.methods.validateAccount = async function () {
	const schema = {
		name: Joi.string().min(2).max(50).required(),
		code: Joi.string().min(3).max(3).required().uppercase()
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	if (this.team === undefined) nexusError('No team ID...', 400);
	if (!mongoose.Types.ObjectId.isValid(this.team)) nexusError('Invalid Team ID...', 400);

	const team = await Team.findById(this.team);
	if (team.length < 1) nexusError(`No team exists with the ID: ${this.team}`, 400);
};

const Account = mongoose.model('account', AccountSchema);

module.exports = { Account };
