const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const accountDebugging = require('debug')('model:accountSystem'); // Debug console log

const clock = require('../wts/gameClock/gameClock')

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
	// This method of the Account Model takes a transaction and deposits the appropriate resource into th
	const { resource, amount, note } = transaction;

	try {
		this.gameState.push(this);
		accountDebugging(`Attempting to deposit ${amount} ${resource} into ${this.name}.`);
		accountDebugging(resources);

		let index = this.resources.findIndex(el => el.type = resource);
		if (index < 0) {
			accountDebugging(`Account doesn't currently have a balance of ${resource}`);
			this.resources.push({ type: resource, balance: 0 });
		}
		else {
			this.resources[index].balance += parseInt(amount);
		}

		accountDebugging(`${amount} ${resource} deposited into ${this.owner}'s ${this.name} account.`);
		accountDebugging(`Reason: ${note}`);

		let account = await account.save();
		return account;

	} catch (err) {
		console.log(err); // TODO: Add error handling
		return err;
	}
};

// Withdrawl Method
AccountSchema.methods.withdrawal = async function (transaction) {
	// This method of the Account Model takes a transaction and deposits the appropriate resource into th
	const { resource, amount, note } = transaction;

	try {
		this.gameState.push(this);
		accountDebugging(`Attempting to deposit ${amount} ${resource} into ${this.name}.`);
		accountDebugging(resources);

		let index = this.resources.findIndex(el => el.type = resource);
		if (index < 0) {
			throw Error(`Account doesn't currently have a balance of ${resource}`)
		}
		else {
			if (this.resources[index].balance > amount) throw Error(`Less then ${amount} ${resource} in ${this.name}`);
			this.resources[index].balance -= parseInt(amount);
		}

		accountDebugging(`${amount} ${resource} withdrawn from ${this.owner}'s ${this.name} account.`);
		accountDebugging(`Reason: ${note}`);

		let account = await account.save();
		return account;

	} catch (err) {
		console.log(err); // TODO: Add error handling
		return err;
	}
};

AccountSchema.methods.transactionLog = async function (transaction, type) {
	const { from, to, resource, amount, note } = transaction;
	try {
		const log = new transactionLog({
			date: Date.now(),
			timestamp: clock.getTimeStamp(),
			team: this.team,
			transaction: type,
			resource,
			account: this.name,
			amount,
			note
		});

		if (type === 'Deposit') log.counterparty = from;
		if (type === 'Withdrawl') log.counterparty = to;

		await log.save();
		accountDebugging(`${type} log created...`);
	}
	catch (err) {
		console.log(err); // TODO: Add error handling
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
