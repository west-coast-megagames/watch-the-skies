const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Trade } = require('../../models/trade');

// @route   GET init/initTrades/lean
// @Desc    Get all trades/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/trades requested...');
	try {
		const trades = await Trade.find().lean();
		res.status(200).json(trades);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/initTrades/:id
// @Desc    Get trades by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const trade = await Trade.findById(id);
		if (trade != null) {
			res.status(200).json(trade);
		}
		else {
			res.status(404).send(`The Trade with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

/* Trades do not currently have a code or unique key
// @route   GET init/initTrades/code/:code
// @Desc    Get trades by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/initTrades/code/:code requested...');
	const code = req.params.code;

	try {
		const trade = await Trade.findOne({ code: code });
		if (trade != null) {
			res.status(200).json(trade);
		}
		else {
			res.status(200).json({ name: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});
*/

module.exports = router;