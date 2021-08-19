// TO-DO:  This route needs to be updated to use the transaction system encapalated in the ACCOUNT model and then turned into a debug route
const nexusEvent = require('../../middleware/events/events');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/util/validateObjectId');

const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging

// Account Model - Using Mongoose Model
const { Account, validateAccount } = require('../../models/account');
const { Team } = require('../../models/team');

// @route   GET api/banking/accounts
// @Desc    Get all Accounts
// @access  Public
router.get('/accounts', async function (req, res) {
	logger.info('Looking up accounts...');
	const accounts = await Account.find()
		.populate('team', 'name shortName')
		.sort({ team: 1 });
	res.json(accounts);
});

// @route   POST api/banking/account
// @Desc    Post a new account
// @access  Public
router.post('/account', async function (req, res) {
	const { teamId, name, code, balance, deposits, withdrawals, queue } = req.body;

	const team = await Team.findById({ _id: teamId });
	if (!team) {
		return res.status(400).send(`Team not found for teamId ${teamId}`);
	}
	const owner = team.shortName;

	const newAccount = new Account(
		// eslint-disable-next-line no-undef
		{ team: teamId, name, code, balance, deposits, withdrawals, queue, owner }
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
	for await (const account of req.body.accounts) {
		const newAccount = new Account(
			account
		);
		const { error } = validateAccount(newAccount);
		if (error) {
			logger.info(`Skipping ${newAccount.name}: Validation Error Post Accounts: ${error.details[0].message}`);
			continue;
		}

		const teamId = account.teamId;
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
	logger.info('Looking up an account...');
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
			account.balance = 1000;
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
	logger.info('Looking up accounts...');
	const accounts = await Account.find({ team });
	res.json(accounts);
});

router.patch('/delAutoTransfer', async function (req, res) {
	logger.info('Attempting to delete auto transaction...');
	logger.info(`${req.body}`);
	const { account_id, transfer_id } = req.body;
	const account = await Account.findOne({ _id: account_id });
	logger.info(`${account.queue}`);
	const indexOf = account.queue.findIndex((t => t._id == transfer_id));
	logger.info(`${indexOf}`);
	account.queue.splice(indexOf, 1);
	logger.info(`${account.queue.length}`);

	account.markModified('queue');
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