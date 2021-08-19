const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Trade } = require('../../models/trade');

// @route   GET api/trade
// @Desc    Get all trades
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/trade requested...');
	try {
		const trade = await Trade.find()
			.populate('initiator.team', 'shortName name code')
			.populate('tradePartner.team', 'shortName name code');
		res.status(200).json(trade);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/trade/:id
// @Desc    Get trade by id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/trade/:id requested...');
	const id = req.params.id;

	try {
		const trade = await Trade.findById(id);
		if (trade != null) {
			res.status(200).json(trade);
		}
		else {
			nexusError(`The trade with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/trade
// @Desc    Post a new trade
// @access  Public
router.post('/', async function (req, res) {
	logger.info('POST Route: api/blueprints call made...');
	let newTrade = new Trade(req.body);

	try {
		await newTrade.validatTrade();
		newTrade = await newTrade.save();
		logger.info('Trade created...');
		res.status(200).json(newTrade);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/trades/:id
// @Desc    Delete one blueprint
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/trades/:id call made...');
	const id = req.params.id;

	try {
		const trade = await Trade.findByIdAndRemove(id);

		if (trade != null) {
			logger.info(`The trade with the id ${id} was deleted!`);
			res.status(200).json(trade);
		}
		else {
			nexusError(`The trade with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/trades/deleteAll
// @desc    Delete All LogErrors
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Trade.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Trades!`);
});

module.exports = router;