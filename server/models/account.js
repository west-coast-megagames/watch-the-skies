const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const accountDebugging = require('debug')('model:accountSystem'); // Debug console log

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema

// Transfer sub-schema
const TransferSchema = new Schema({
	to: { type: String },
	from: { type: String },
	resource: { type: String },
	amount: { type: Number },
	note: { type: String }
});

const BalanceSchema = new Schema({
	type: { type: String },
	balance: { type: Number, default: 0 }
});

// Account Schema
const AccountSchema = new Schema({
	model: { type: String, default: 'Account' },
	team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	owner: { type: String },
	name: { type: String, minlength: 2, maxlength: 50, required: true },
	code: { type: String, minlength: 3, maxlength: 3, required: true },
	resources: [BalanceSchema],
	reports: { type: Schema.Types.ObjectId, ref: 'Report' },
	autoTransfers: [TransferSchema],
	gameState: []
});

// Deposit Method
AccountSchema.methods.deposit = async function (transaction) {
	const { from, resource, amount, note } = transaction;
	try {
		accountDebugging(`Attempting to deposit into ${this.name}.`);
		accountDebugging(`Current amount in ${this.name}: ${this.balance}`);
		this.balance += parseInt(amount);

		accountDebugging(`${amount} deposited into ${this.owner}'s ${this.name} account.`);
		accountDebugging(`Reason: ${note}`);

		const { getTimeRemaining } = require('../gameClock/gameClock');
		const { turn, phase, turnNum, minutes, seconds } = getTimeRemaining();

		account = trackTransaction(account, amount, 'deposit');

		const log = new transactionLog({
			date: Date.now(),
			timestamp: {
				turn,
				phase,
				turnNum,
				clock: `${minutes}:${seconds}`
			},
			team: this.team,
			transaction: 'Deposit',
			account: this.name,
			amount,
			note
		});

		log.save();
		let account = await account.save();

		accountDebugging('Deposit log created...');
		return account;

	} catch (err) {
		console.log(err);
		return err;
	}
};


// validateAccount method
AccountSchema.methods.validateAccount = async function () {
	const { validTeam } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		code: Joi.string().min(3).max(3).required().uppercase(),
		owner: Joi.string(),
		balance: Joi.number()
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.team);
};

const Account = mongoose.model('account', AccountSchema); // Creation of Account Model

module.exports = { Account };
