const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Site } = require('../../models/site');

// @route   GET init/initSite/lean
// @Desc    Get all sites/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: init/initSites requested...');
	try {
		const sites = await Site.find().lean()
			.sort('code: 1');
		res.status(200).json(sites);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/initSite/:id
// @Desc    Get sites by id
// @access  Public
router.get('/:id', validateObjectId, async function (req, res) {
	logger.info('GET Route: api/site/:id requested...');
	const id = req.params.id;

	try {
		const site = await Site.findById(req.params.id).select('code email name geoDecimal');

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

// @route   GET init/initSites/validate/:id
// @Desc    Validate site with id
// @access  Public
router.get('/validate/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const site = await Site.findById(id);
		if (site != null) {
			try {
				await site.validateSite();
				res.status(200).json(site);
			}
			catch(err) {
				res.status(200).send(`Site validation Error! ${err.message}`);
			}
		}
		else {
			res.status(404).send(`Site with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;