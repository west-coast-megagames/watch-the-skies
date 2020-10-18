const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Squad } = require('../../models/squad');

// @route   GET init/squads/lean
// @Desc    Get all squads/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/squads requested...');
	try {
		const squads = await Squad.find().lean()
			.sort('name: 1');
		res.status(200).json(squads);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/squads/:id
// @Desc    Get squads by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const squad = await Squad.findById(id);
		if (squad != null) {
			res.status(200).json(squad);
		}
		else {
			res.status(404).send(`The Squad with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/squads/name/:name
// @Desc    Get squads by name
// @access  Public
router.get('/name/:name', async (req, res) => {
	logger.info('GET Route: init/squads/name/:name requested...');
	const name = req.params.name;

	try {
		const squad = await Squad.findOne({ name: name });
		if (squad != null) {
			res.status(200).json(squad);
		}
		else {
			res.status(200).json({ type: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initSquads/validate/:id
// @Desc    Validate squad with id
// @access  Public
router.get('/validate/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const squad = await Squad.findById(id);
		if (squad != null) {
			try {
				await squad.validateSquad();
				res.status(200).json(squad);
			}
			catch(err) {
				res.status(200).send(`Squad validation Error! ${err.message}`);
			}
		}
		else {
			res.status(404).send(`Squad with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;