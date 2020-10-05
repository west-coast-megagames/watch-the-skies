const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Treaty } = require('../../models/treaty');

// @route   GET init/initTreaties/lean
// @Desc    Get all treatys/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: init/initTreatyies requested...');
	try {
		const treatys = await Treaty.find().lean();
		res.status(200).json(treatys);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/initTreaties/:id
// @Desc    Get treatys by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const treaty = await Treaty.findById(id);
		if (treaty != null) {
			res.status(200).json(treaty);
		}
		else {
			res.status(404).send(`The Treaty with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

/* Treatys do not currently have a code or unique key
// @route   GET init/initTreaties/code/:code
// @Desc    Get treatys by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/initTreaties/code/:code requested...');
	const code = req.params.code;

	try {
		const treaty = await Treaty.findOne({ code: code });
		if (treaty != null) {
			res.status(200).json(treaty);
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