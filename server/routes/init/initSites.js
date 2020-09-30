const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Site } = require('../../models/site');

// @route   GET init/initSite/:id
// @Desc    Get sites by id
// @access  Public
router.get('/:id', validateObjectId, async function (req, res) {
	logger.info('GET Route: api/site/:id requested...');
	const id = req.params.id;

	try {
		const site = await Site.findById(req.site._id).select('code email name');

		if (site != null) {
			logger.info(`Verifying ${site.code}`);
			res.status(200).json(site);
		}
		else {
			nexusError(`The site with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initSites/code/:code
// @Desc    Get Site by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/initSites/code/:code requested...');
	const code = req.params.code;

	try {
		const site = await Site.findOne({ code: code });
		if (site != null) {
			res.status(200).json(site);
		}
		else {
			res.status(200).json({ type: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;