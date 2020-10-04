const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Research } = require('../../models/research');

// @route   GET init/research/lean
// @Desc    Get all researchs/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/researchs requested...');
	try {
		const researchs = await Research.find().lean()
			.sort('code: 1');
		res.status(200).json(researchs);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/research/:id
// @Desc    Get researchs by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const research = await Research.findById(id);
		if (research != null) {
			res.status(200).json(research);
		}
		else {
			res.status(404).send(`The Research with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/research/code/:code
// @Desc    Get researchs by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/research/code/:code requested...');
	const code = req.params.code;

	try {
		const research = await Research.findOne({ code: code });
		if (research != null) {
			res.status(200).json(research);
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