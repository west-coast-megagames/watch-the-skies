const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const accountDebugging = require('debug')('model:accountSystem'); // Debug console log
const { Transaction } = require('./report'); // WTS Game log function

const clock = require('../wts/gameClock/gameClock');
const nexusEvent = require('../middleware/events/events');

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
	queue: [TransferSchema],
	tags: [{ type: String, enum: ['']} ]
});

// METHOD - deposit
AccountSchema.methods.deposit = async function (transaction) {
	// This method of the Account Model takes a transaction and deposits the appropriate resource into th
	const { resource, amount, note } = transaction;

	try {
		accountDebugging(`Attempting to deposit ${amount} ${resource} into ${this.name}.`);
		accountDebugging(resource);

		let index = this.resources.findIndex(el => el.type = resource);
		if (index < 0) {
			console.log(`Account doesn't currently have a balance of ${resource}`);
			this.resources.push({ type: resource, balance: 0 });
			index = this.resources.findIndex(el => el.type = resource);
		}

		this.resources[index].balance += parseInt(amount);
		this.markModified('resources');

		accountDebugging(`${amount} ${resource} deposited into ${this.owner}'s ${this.name} account.`);
		accountDebugging(`Reason: ${note}`);

		await this.report(transaction, 'Deposit');

		let account = await this.save();
		account = await account.populateMe();
		// console.log(account);

		// Notify/Update team via socket-event
		nexusEvent.emit('request', 'update', [ account ]); //
		return account;

	}
	catch (err) {
		console.log(err); // TODO: Add error handling
		return err;
	}
};

// METHOD - withdrawl
// IN - Transaction Object { team_id, to, from, amount, note }
// OUT: Modified Accounts Object - From the Team Object
// PROCESS: This method of the Account Model takes a transaction and withdraws the appropriate resource from the account
AccountSchema.methods.withdrawal = async function (transaction) {
	const { resource, amount, note } = transaction;

	try {
		accountDebugging(`Attempting to withdrawl ${amount} ${resource} from ${this.name}.`);
		accountDebugging(resource);

		const index = this.resources.findIndex(el => el.type === resource);
		if (index < 0) {
			throw Error(`Account doesn't currently have a balance of ${resource}`);
		}
		else {
			if (this.resources[index].balance < amount) throw Error(`Less then ${amount} ${resource} in ${this.name}`);
			this.resources[index].balance -= parseInt(amount);
			this.markModified('resources');
		}

		accountDebugging(`${amount} ${resource} withdrawn from ${this.owner}'s ${this.name} account.`);
		accountDebugging(`Reason: ${note}`);

		await this.report(transaction, transaction.to ? 'Withdrawal' : 'Expense');

		let account = await this.save();
		account = await account.populateMe();

		nexusEvent.emit('request', 'update', [ account ]); // Notify/Update team via socket-event
		return account;
	}
	catch (err) {
		console.log(err); // TODO: Add error handling
		return err;
	}
};

// METHOD - spend
// IN - Spend Object { amount, note, resource }
// OUT: Modified Accounts Object - From the Team Object
// PROCESS: This method of the Account Model removes the appropriate resource from the account
AccountSchema.methods.spend = async function (transaction) {
	const { resource, amount, note } = transaction;

	try {
		accountDebugging(`Attempting to spend ${amount} ${resource} from ${this.name}.`);
		accountDebugging(resource);

		const index = this.resources.findIndex(el => el.type === resource);
		if (index < 0) {
			throw Error(`Account doesn't currently have a balance of ${resource}`);
		}
		else {
			if (this.resources[index].balance < amount) throw Error(`Less then ${amount} ${resource} in ${this.name}`);
			this.resources[index].balance -= parseInt(amount);
			this.markModified('resources');
		}

		accountDebugging(`${amount} ${resource} withdrawn from ${this.owner}'s ${this.name} account.`);
		accountDebugging(`Reason: ${note}`);

		await this.report(transaction, 'Expense');

		let account = await this.save();
		account = await account.populateMe();

		nexusEvent.emit('request', 'update', [ account ]); // Notify/Update team via socket-event
		return account;
	}
	catch (err) {
		console.log(err); // TODO: Add error handling
		throw err;
		return err;
	}
};

// METHOD - schedule
// IN - Transaction Object { team_id, to, from, amount, note }
// OUT: String Message
// PROCESS: Schedules a transaction for a later date.
AccountSchema.methods.schedule = async function (transaction) {

	try {
		this.queue.push(transaction);
		this.markModified('queue');

		accountDebugging(`${this.owner} is setting up an automatic payment!`);

		console.log(`${this.owner} has set up an auto-transfer for ${this.name}`);

		let account = await this.save();
		account = await account.populateMe();
		// console.log(account);

		// Notify/Update team via socket-event
		nexusEvent.emit('request', 'update', [ account ]); // Scott Note: Untested might not work
		return `${this.owner} scheduled a transaction`;
	}
	catch (err) {
		console.log(err); // TODO: Add error handling
		return err;
	}
};

// METHOD - resolveQueue
// IN - VOID
// OUT: String Message
// PROCESS: Conducts all transfers currently in the queue
AccountSchema.methods.resolveQueue = async function () {
	let count = 0;
	for await (const transaction of this.queue) {
		let complete = false;
		if (transaction !== null) complete = await this.transfer(transaction);
		if (complete) {
			const index = this.queue.findIndex(el => el.id === transaction.id);
			this.queue.splice(index, 1);
			count++;
		}
	}

	const message = `${count} transactions completed for ${this.owner}'s ${this.name} account`;
	console.log(message);
	return message;
};

// METHOD - transfer
// IN - Transaction Object { team_id, to, from, amount, note }
// OUT: VOID
// PROCESS: Transfers resources from the initiator to the counterparty
AccountSchema.methods.transfer = async function (transaction) {
	const { to } = transaction; // {} resource, to, amount, note }

	try {
		await this.withdrawal(transaction);

		const counterparty = await Account.findOne({ _id: to });
		await counterparty.deposit(transaction);

		accountDebugging(`${this.owner}s transfer completed!`);

		return true;
	}
	catch (err) {
		console.log(err); // TODO: Add error handling
		// TODO: Revert the transaction if there are any errors
		return err;
	}
};

AccountSchema.methods.report = async function (transaction, type) {
	const { from, to, resource, amount, note } = transaction;
	try {
		let report = new Transaction({
			date: Date.now(),
			timestamp: clock.getTimeStamp(),
			team: this.team,
			transaction: type,
			resource,
			account: this.name,
			amount,
			note
		});

		if (type === 'Deposit') report.counterparty = from;
		if (type === 'Withdrawal') report.counterparty = to;

		report = await report.save();
		// report = await report.populateMe();

		// Notify/Update team via socket-event
		nexusEvent.emit('request', 'create', [ report ]); // Scott Note: Untested might not work
		console.log(`${type} report created...`);
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
		tags: Joi.array().items(Joi.string().valid(''))
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.team);
};

AccountSchema.methods.populateMe = function () {
	return this
		.populate('team', 'name shortName')
		.execPopulate();
};

const Account = mongoose.model('account', AccountSchema); // Creation of Account Model

module.exports = { Account };
