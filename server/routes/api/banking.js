const routeDebugger = require('debug')('app:routes');
const nexusEvent = require('../../middleware/events/events');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/util/validateObjectId');

const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging

// Interceptor Model - Using Mongoose Model
const { Account, validateAccount } = require('../../models/account');
const { Team } = require('../../models/team');
const banking = require('../../wts/banking/banking');

// @route   GET api/banking/accounts
// @Desc    Get all Accounts
// @access  Public
router.get('/accounts', async function (req, res) {
	routeDebugger('Looking up accounts...');
	const accounts = await Account.find()
		.populate('team', 'name shortName')
		.sort({ team: 1 });
	res.json(accounts);
});

// @route   POST api/banking/account
// @Desc    Post a new account
// @access  Public
router.post('/account', async function (req, res) {
	const { teamId, name, code, balance, deposits, withdrawals, autoTransfers } = req.body;

	const team = await Team.findById({ _id: teamId });
	if (!team) {
		return res.status(400).send(`Team not found for teamId ${teamId}`);
	}
	owner = team.shortName;

	const newAccount = new Account(
		{ team: teamId, name, code, balance, deposits, withdrawals, autoTransfers, owner }
	);
	const { error } = validateAccount(newAccount);
	if (error) return res.status(400).send(error.details[0].message);

	const docs = await Account.find({ team: teamId, name })
		.populate('team', 'name shortName');
	if (!docs.length) {
		const account = await newAccount.save();
		res.json(account);
		logger.info(`${name} account created...`);
	}
	else {
		logger.info(`${name} account already exists for this team...`);
		res.send(`${name} account already exists for this team...`);
	}
});

// @route   POST api/banking/accounts
// @Desc    Post a new account
// @access  Public
router.post('/accounts', async function (req, res) {
	let recCount = 0;
	for (const account of req.body.accounts) {
		const newAccount = new Account(
			account
		);
		const { error } = validateAccount(newAccount);
		if (error) {
			logger.info(`Skipping ${newAccount.name}: Validation Error Post Accounts: ${error.details[0].message}`);
			continue;
		}

		teamId = account.teamId;
		const team = await Team.findById({ _id: teamId });
		if (!team) {
			logger.info(`Team not found for teamId ${account.teamId}`);
			continue;
		}
		newAccount.owner = team.shortName;
		newAccount.team = team._id;

		const docs = await Account.find({ name: newAccount.name, team: newAccount.team });
		if (!docs.length) {
			await newAccount.save();
			logger.info(`${newAccount.owner} created ${newAccount.name} account...`);
			++recCount;
		}
		else {
			logger.info(`${newAccount.name} account already exists for this team... `);
		}
	}
	return res.status(200).send(`${recCount} Accounts Created...`);
});

// @route   GET api/banking/accounts/:id
// @Desc    Get a single account by id
// @access  Public
router.get('/accounts/:id', validateObjectId, async function (req, res) {
	routeDebugger('Looking up an account...');
	const account = await Account.findById({ _id: req.params.id })
		.populate('team', 'name shortName');
	res.json(account);
});

// @route   PATCH api/banking/accounts
// @desc    Update all teams to base income and PR
// @access  Public
router.patch('/accounts', async function (req, res) {
	for await (const account of Account.find()) {
		{
			account.balance = 0;
			account.deposits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			account.withdrawals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		}

		await account.save();
		logger.info(`${account.owner}'s ${account.name} reset...`);
	}
	res.send('Accounts succesfully reset!');

	nexusEvent.emit('updateAccounts');
});

router.put('/accounts', async function (req, res) {
	const { team } = req.body;
	routeDebugger('Looking up accounts...');
	const accounts = await Account.find({ team });
	res.json(accounts);
});

router.patch('/delAutoTransfer', async function (req, res) {
	routeDebugger('Attempting to delete auto transaction...');
	routeDebugger(`${req.body}`);
	const { account_id, transfer_id } = req.body;
	const account = await Account.findOne({ _id: account_id });
	routeDebugger(`${account.autoTransfers}`);
	const indexOf = account.autoTransfers.findIndex((t => t._id == transfer_id));
	routeDebugger(`${indexOf}`);
	account.autoTransfers.splice(indexOf, 1);
	routeDebugger(`${account.autoTransfers.length}`);

	account.markModified('autoTransfers');
	await account.save();
	res.status(200).send('Automatic transfer deleted!');
	nexusEvent.emit('updateAccounts');
});


// @route   POST api/banking/withdrawal
// @desc    Submit a withdrawal
// @access  Public
router.post('/withdrawal', async function (req, res) {
	const { account_id, amount, note } = req.body;

	try {
		const account = await Account.findById(account_id);
		await banking.withdrawal(account, amount, note);
		nexusEvent.emit('updateAccounts');
		res.status(200).send(`You have submitted a ${amount} withdrawal due to ${note}`);
	}
	catch (err) {
		res.status(400).send(err);
	}
});

module.exports = router;