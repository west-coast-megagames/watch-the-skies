const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Site } = require('../../models/site');

// @route   GET api/sites
// @Desc    Get all sites
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/sites requested...');

	try {
		const sites = await Site.find()
			.populate('country', 'name')
			.populate('team', 'shortName name')
			.populate('facilities', 'name type')
			.populate('zone', 'model name code')
			.sort({ name: -1 });
		res.status(200).json(sites);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}

});

// @route   GET api/sites/:id
// @Desc    Get sites by id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const site = await Site.findById(id)
			.populate('country', 'name')
			.populate('team', 'shortName name')
			.populate('facilities', 'name type')
			.populate('zone', 'model name code')
			.sort({ team: 1 });
		if (site != null) {
			res.json(site);
		}
		else {
			nexusError(`The Site with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}

});

// TODO: Add GET route that allows for getting by discriminator

// TODO: Add POST route that allows for each discriminator to be built

// TODO: Add DEL route that allows for deletion by ID.

module.exports = router;
