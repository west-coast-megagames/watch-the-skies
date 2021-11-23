const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Organization } = require('../../models/organization');

// @route   GET init/organizations/lean
// @Desc    Get all organizations/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/organizations requested...');
	try {
		const organizations = await Organization.find().lean()
			.sort('code: 1');
		res.status(200).json(organizations);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/initOrganizations/code/:code
// @Desc    Get Organization by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/initOrganizations/code/:code requested...');
	const code = req.params.code;

	try {
		const organization = await Organization.findOne({ code: code });
		if (organization != null) {
			res.status(200).json(organization);
		}
		else {
			res.status(200).json({ type: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/organizations/:id
// @Desc    Get organizations by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const organization = await Organization.findById(id);
		if (organization != null) {
			res.status(200).json(organization);
		}
		else {
			res.status(404).send(`The Organization with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   Patch init/organizations/borderedBy/:id
// @Desc    Update borderedBy for Organization
// @access  Public
router.patch('/borderedBy/:id', validateObjectId, async (req, res) => {
	logger.info('Patch Route: init/organizations/borderedBy requested...');
	const id = req.params.id;
	const updBorderedBy = req.body;

	try {
		const organization = await Organization.findById(id);
		if (organization != null) {
			organization.borderedBy = updBorderedBy;
			const updOrganization = await organization.save();
			res.status(200).json(updOrganization);
			logger.info(`Borderedby for Organization ${updOrganization.code} updated...`);
		}
		else {
			logger.error(`Failed to update Borderedby for Organization ${id}`);
			res.status(400).json({ type: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/organizations/validate/:id
// @Desc    Validate organization with id
// @access  Public
router.get('/validate/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const organization = await Organization.findById(id);
		if (organization != null) {
			try {
				await organization.validateOrganization();
				res.status(200).json(organization);
			}
			catch(err) {
				res.status(200).send(`The Organization validation Error! ${err.message}`);
			}
		}
		else {
			res.status(404).send(`The Organization with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;
