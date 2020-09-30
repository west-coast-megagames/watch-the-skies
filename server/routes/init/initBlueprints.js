const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Blueprint } = require('../../models/blueprint');

// @route   GET init/initBlueprint/:id
// @Desc    Get blueprints by id
// @access  Public
router.get('/:id', validateObjectId, async function (req, res) {
	logger.info('GET Route: api/blueprint/:id requested...');
	const id = req.params.id;

	try {
		const blueprint = await Blueprint.findById(req.blueprint._id).select('code email name');

		if (blueprint != null) {
			logger.info(`Verifying ${blueprint.code}`);
			res.status(200).json(blueprint);
		}
		else {
			nexusError(`The blueprint with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initBlueprints/code/:code
// @Desc    Get Blueprint by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/initBlueprints/code/:code requested...');
	const code = req.params.code;

	try {
		const blueprint = await Blueprint.findOne({ code: code });
		if (blueprint != null) {
			res.status(200).json(blueprint);
		}
		else {
			res.status(200).json({ desc: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;