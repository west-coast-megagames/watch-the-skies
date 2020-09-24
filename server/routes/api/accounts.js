const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const validateObjectId = require('../../middleware/util/validateObjectId');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging

// Interceptor Model - Using Mongoose Model
const { Account } = require('../../models/account'); // Financial Account Model
const { Team } = require('../../models/team'); // WTS Team Model
const nexusError = require('../../middleware/util/throwError'); // Custom Error handling for Nexus
const httpErrorHandler = require('../../middleware/util/httpError'); // Custom HTTP error sending for Nexus

// @route   GET api/account
// @Desc    Get all Accounts
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/account requested...');
	try {
		const accounts = await Account.find()
			.sort({ team: 1 })
			.populate('team', 'name shortName');
		res.status(200).json(accounts);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/account/:id
// @Desc    Get a single account by ID
// @access  Public
router.get('/:id', validateObjectId, async function (req, res) {
	logger.info('GET Route: api/account/:id requested...');
	try {
		const account = await Account.findById({ _id: req.params.id })
			.populate('team', 'name shortName');
		if (account != null) {
			res.status(200).json(account);
		}
		else {
			nexusError(`There is no account with the ID ${req.params.id}`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/account
// @Desc    Post a new account
// @access  Public
router.post('/', async function (req, res) {
	logger.info('POST Route: api/account call made...');

	try {
		let newAccount = new Account(req.body);
		await newAccount.validateAccount();
		const docs = await Account.find({ name: req.body.name, team: req.body.team });

		if (docs.length < 1) {
			newAccount = await newAccount.save();
			await Team.populate(newAccount, { path: 'team', model: 'Team', select: 'name' });
			logger.info(`${newAccount.name} account created for ${newAccount.team.name} ...`);
			res.status(200).json(newAccount);
		}
		else {
			nexusError(`${newAccount.name} account already exists!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/account/:id
// @Desc    Delete a account
// @access  Public
router.delete('/:id', validateObjectId, async function (req, res) {
	logger.info('DEL Route: api/account/:id call made...');
	const id = req.params.id;

	try {
		const account = await Account.findByIdAndRemove(id);
		if (account != null) {
			logger.info(`${account.name} with the id ${id} was deleted!`);
			res.status(200).send(`${account.name} with the id ${id} was deleted!`);
		}
		else {
			nexusError(`No account with the id ${id} exists!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;