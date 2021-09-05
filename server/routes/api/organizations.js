const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Organization, GroundOrganization, SpaceOrganization } = require('../../models/organization');
const { Site } = require('../../models/site');

// @route   GET api/counties
// @Desc    Get all organizations
// @access  Public
router.get('/', async (req, res) => {
	logger.info('GET Route: api/organizations requested...');
	try {
		const organizations = await Organization.find()
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('borderedBy', 'name')
			.sort('code: 1');
		res.status(200).json(organizations);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/counties/:key/:value
// @Desc    Get by property
// @access  Public
router.get('/:key/:value', async (req, res) => {
	logger.info('GET Route: api/organizations requested...');
	const query = {};
	query[req.params.key] = req.params.value;

	try {
		const organizations = await Organization.find(query)
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('borderedBy', 'name')
			.sort('code: 1');
		res.status(200).json(organizations);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/organizations/:id
// @Desc    Get organizations by id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	try {
		const organization = await Organization.findById(id)
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('borderedBy', 'name');
		if (organization != null) {
			res.status(200).json(organization);
		}
		else {
			res.status(404).send(`The organization with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// TODO: Add GET route that allows for getting by discriminator

// @route   POST api/organizations
// @Desc    Create New Organization
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/organizations call made...');
	const { code } = req.body;

	try {
		let newOrganization;
		if (req.body.type === 'Ground') {
			newOrganization = new GroundOrganization(req.body);
		}
		if (req.body.type === 'Space') {
			newOrganization = new SpaceOrganization(req.body);
		}
		await newOrganization.validateOrganization();
		const docs = await Organization.find({ code });

		if (docs.length < 1) {
			newOrganization = await newOrganization.save();
			res.status(200).json(newOrganization);
			logger.info(`The organization ${newOrganization.name} created...`);
		}
		else {
			nexusError(`A organization with the code ${newOrganization.code} already exists!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/organizations/:id
// @Desc    Update Existing Organization
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/contries/:id call made...');
	const id = req.params.id;

	try {
		const organization = await Organization.findByIdAndRemove(id);

		if (organization != null) {
			logger.info(`The organization ${organization.name} with the id ${id} was deleted!`);
			res.status(200).json(organization);
		}
		else {
			nexusError(`The Organization with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/organizations/deleteAll
// @desc    Delete All Organizations
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	try {
		await Organization.deleteMany();
		res.status(200).send('All Organizations succesfully deleted!');
	}
	catch (err) {
		console.log(`Error: ${err.message}`);
		res.status(400).send(`Error: ${err.message}`);
	}
});

// @route   PATCH api/organizations/setCapital
// @desc    Set Organizations Capital (site id to city)
// @access  Public
router.patch('/setCapital/:id', validateObjectId, async function (req, res) {
	const organizationId = req.params.id;
	try {

		const capital = await Site.findOne({ 'type': 'Ground', 'subType': 'City', 'organization': organizationId, 'tags': 'capital' });

		if (capital) {
			const organization = await Organization.findByIdAndUpdate(organizationId,
				{ capital: capital._id },
				{ new: true, omitUndefined: true });
			logger.info(`The organization ${organization.name} with the id ${organizationId} updated with Capital!`);
			res.status(200).json(organization);
		}
		else {
			res.status(200);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;