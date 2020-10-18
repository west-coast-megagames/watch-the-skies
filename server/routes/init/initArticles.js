const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Article } = require('../../models/article');

// @route   GET init/articles/lean
// @Desc    Get all articles/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/articles requested...');
	try {
		const articles = await Article.find().lean()
			.sort('headline: 1');
		res.status(200).json(articles);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/articles/:id
// @Desc    Get articles by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const article = await Article.findById(id);
		if (article != null) {
			res.status(200).json(article);
		}
		else {
			res.status(404).send(`The Article with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initArticles/validate/:id
// @Desc    Validate article with id
// @access  Public
router.get('/validate/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const article = await Article.findById(id);
		if (article != null) {
			try {
				await article.validateArticle();
				res.status(200).json(article);
			}
			catch(err) {
				res.status(200).send(`Article validation Error! ${err.message}`);
			}
		}
		else {
			res.status(404).send(`Article with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;