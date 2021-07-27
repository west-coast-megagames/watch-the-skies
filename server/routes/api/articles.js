const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Function Import
const clock = require('../../wts/gameClock/gameClock');

// Mongoose Model Import
const { Article } = require('../../models/article');
const { Team } = require('../../models/team');
const { Site } = require('../../models/site');

// @route   GET api/articles
// @Desc    Get all articles
// @access  Public
router.get('/', async (req, res) => {
	logger.info('GET Route: api/articles requested...');
	try {
		const articles = await Article.find()
			.populate('publisher', 'name shortName')
			.populate('location', 'name dateline')
			.sort('date: 1');
		res.status(200).json(articles);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/articles/:id
// @Desc    Get articles by id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/articles/:id requested...');
	const id = req.params.id;
	try {
		const article = await Article.findById(id)
			.populate('publisher', 'name shortName')
			.populate('location', 'name dateline');
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

// @route   POST api/articles
// @Desc    Create New Article
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/articles call made...');
	let newArticle = new Article(req.body);

	try {
		newArticle.date = new Date();
		const retTimestamp = clock.getTimeStamp();
		if (retTimestamp) {
			newArticle.timestamp = retTimestamp;
		}
		else {
			newArticle.timestamp = req.body.timestamp;
		}

		logger.info(`new Article time stamp ${newArticle.timestamp}`);
		const location = await Site.findById(newArticle.location);
		newArticle.dateline = location.dateline;
		logger.info(`new Article time stamp ${newArticle.timestamp}`);
		await newArticle.validateArticle();
		logger.info(`new Article time stamp ${newArticle.timestamp}`);

		const docs = await Article.find({ headline: newArticle.headline, publisher: newArticle.publisher });

		if (docs.length < 1) {
			newArticle = await newArticle.save();
			// TODO: Team.populate is NOT working ... avoiding error on logger.info
			await Team.populate(newArticle, { path: 'publisher', model: 'Team', select: 'name' });
			if (newArticle.team) {
				logger.info(`${newArticle.headline} article created for ${newArticle.team.name} ...`);
			}
			res.status(200).json(newArticle);
		}
		else {
			nexusError(`An article with the headline ${newArticle.headline} has already been published!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/articles/id
// @Desc    Update Existing Article
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/articles/:id call made...');
	const id = req.params.id;

	try {
		const article = await Article.findByIdAndRemove(req.params.id);

		if (article != null) {
			logger.info(`The ${article.headline} article with the id ${id} was deleted!`);
			res.status(200).json(article);
		}
		else {
			nexusError(`The Article with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/articles/deleteAll
// @desc    Delete All Articles
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Article.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Articles!`);
});

module.exports = router;