const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const validateObjectId = require('../../middleware/validateObjectId');
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
		logger.error(err.message, { meta: err });
		res.status(400).send(err.message);
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
		logger.error(err.message, { meta: err });
		res.status(400).send(err.message);
	}

});

// @route   POST api/account
// @Desc    Post a new account
// @access  Public
router.post('/', async function (req, res) {
	const { name, code, balance, deposits, withdrawls, autoTransfers } = req.body;
	const { error } = validateAccount(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	try {
		const newAccount = new Account(
			{ name, code, balance, deposits, withdrawls, autoTransfers }
		);
		if (req.body.teamCode != '') {
			const team = await Team.findOne({ teamCode: req.body.teamCode });
			if (!team) {
				throw `Account Post Team Error, New Account: ${req.body.name} Code: ${req.body.code} Team: ${req.body.teamCode}`;
			}
			else {
				newAccount.team = team._id;
			}
		}

		const docs = await Account.find({ name });
		if (!docs.length) {
			const account = await newAccount.save();
			res.json(account);
			logger.info(`The ${name} account created for ...`);
		}
		else {
			throw `${name} account already exists!`;
		}
	}
	catch (err) {
		logger.error(err.message, { meta: err });
		res.status(400).send(err.message);
	}
});

// @route   DELETE api/account/:id
// @Desc    Delete a account
// @access  Public
router.delete('/:id', validateObjectId, async function (req, res) {
	const id = req.params.id;
	const account = await Account.findByIdAndRemove(id);
	if (account != null) {
		logger.info(`${account.name} with the id ${id} was deleted!`);
		res.status(200).send(`${account.name} with the id ${id} was deleted!`);
	}
	else {
		res.status(400).send(`No account with the id ${id} exists!`);
	}
});

module.exports = router;