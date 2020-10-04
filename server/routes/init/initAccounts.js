const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Account } = require('../../models/account');

// @route   GET init/accounts/lean
// @Desc    Get all accounts/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/accounts requested...');
	try {
		const accounts = await Account.find().lean()
			.sort('code: 1');
		res.status(200).json(accounts);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/accounts/:id
// @Desc    Get accounts by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const account = await Account.findById(id);
		if (account != null) {
			res.status(200).json(account);
		}
		else {
			res.status(404).send(`The Account with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/accounts/code/:code
// @Desc    Get accounts by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/accounts/code/:code requested...');
	const code = req.params.code;

	try {
		const account = await Account.findOne({ code: code });
		if (account != null) {
			res.status(200).json(account);
		}
		else {
			res.status(200).json({ type: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/accounts/code/:code
// @Desc    Get accounts by code
// @access  Public
router.get('/teamacct/:teamId/:code', async (req, res) => {
	logger.info('GET Route: init/accounts/teamacct/:teamId/:code requested...');
	const code = req.params.code;
	const teamId = req.params.teamId;

	try {
		const account = await Account.findOne({ team: teamId, code: code });
		if (account != null) {
			res.status(200).json(account);
		}
		else {
			res.status(200).json({ owner: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;