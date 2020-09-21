const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const validateObjectId = require('../../middleware/util/validateObjectId');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging

// Interceptor Model - Using Mongoose Model
const { Account, validateAccount } = require('../../models/account'); // Financial Account Model
const { Team } = require('../../models/team'); // Team Model

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
// @Desc    Get all single account
// @access  Public
router.get('/:id', validateObjectId, async function (req, res) {
	logger.info('GET Route: api/account/:id requested...');
	try {
		const account = await Account.findById({ _id: req.params.id })
			.populate('team', 'name shortName');
		res.json(account);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(400).send(err.message);
	}

});

// @route   POST api/account
// @Desc    Post a new account
// @access  Public
router.post('/', async function (req, res) {
	logger.info('POST Route: api/account post made...');
	const { error } = validateAccount(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	try {
		let newAccount = new Account(req.body);
		newAccount.validate();
		const docs = await Account.find({ name: req.body.name, team: req.body.team });

		if (docs.length < 1) {
			newAccount = await newAccount.save();
			await Team.populate(newAccount, { path: 'team', model: 'Team', select: 'name' });
			logger.info(`${newAccount.name} account created for ${newAccount.team.name} ...`);
			res.status(200).json(newAccount);
		}
		else {
			let err = new Error(`${newAccount.name} account already exists!`);
			err.type = 'User Error';
			throw err;
		}
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		if (err.type === 'User Error') {
			res.status(400).send(`Bad request: ${err.message}`);
		}
		else {
			res.status(500).send(`Server error: ${err.message}`);
		}
	}
});

// @route   DELETE api/account/:id
// @Desc    Delete a account
// @access  Public
router.delete('/:id', validateObjectId, async function (req, res) {
	const id = req.params.id;
	try {
		const account = await Account.findByIdAndRemove(id);
		if (account != null) {
			logger.info(`${account.name} with the id ${id} was deleted!`);
			res.status(200).send(`${account.name} with the id ${id} was deleted!`);
		}
		else {
			throw { type: 'User Error', message: `No account with the id ${id} exists!` }
		}
	}
	catch (err) {
		logger.error(err.message, { meta: err });
		if (err.type === 'User Error') {
			res.status(400).send(`Bad request: ${err.message}`);
		}
		else {
			res.status(500).send(`Server error: ${err.message}`);
		}
	}
});

module.exports = router;