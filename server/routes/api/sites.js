const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Site, GroundSite, SpaceSite } = require('../../models/site');

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
			.populate('occupier', 'name shortName code')
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
			.populate('occupier', 'name shortName code')
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

// @route   GET api/sites/type - allows for getting by discriminator
// @Desc    Get all sites by type
// @access  Public
router.get('/type/:type', async function (req, res) {
	logger.info('GET Route: api/sites/type requested...');

	try {
		const type = req.params.type;
		const sites = await Site.find(type)
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

// @route   POST api/sites
// @Desc    Create New site
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/sites call made...');

	try {
		let newSite;
		switch (req.body.type) {

		case('Ground'):
			newSite = new GroundSite(req.body);
			break;

		case('Space'):
			newSite = new SpaceSite(req.body);
			break;

		default:
			logger.info(`Site ${req.body.name} has invalid type ${req.body.type}`);
			res.status(500).json(newSite);

		}
		await newSite.validateSite();
		newSite = await newSite.save();
		logger.info(` Site ${newSite.code} - ${newSite.name} created...`);
		res.status(200).json(newSite);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/sites/:id
// @Desc    Delete one site
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/sites/:id call made...');
	const id = req.params.id;

	try {
		const site = await Site.findByIdAndRemove(id);

		if (site != null) {
			logger.info(`The ${site.headline} site with the id ${id} was deleted!`);
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

// @route   PATCH api/sites/deleteAll
// @desc    Delete All Sites
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Site.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Sites!`);
});

// @route   PATCH api/sites/deleteAllCity
// @desc    Delete All City Sites
// @access  Public
router.patch('/deleteAllCity/', async function (req, res) {
	const data = await Site.deleteMany({ subType: 'City' });
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} City Sites!`);
});

// @route   PATCH api/sites/deleteAllSpacecraft
// @desc    Delete All Spacecraft Sites
// @access  Public
router.patch('/deleteAllSpacecraft/', async function (req, res) {
	const data = await Site.deleteMany({ type: 'Space' });
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Spacecraft Sites!`);
});

module.exports = router;
