const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const articleDebugger = require('debug')('app:article');
const validateObjectId = require('../../middleware/validateObjectId');

// Function Import
const { getTimeRemaining } = require('../../wts/gameClock/gameClock');

// Mongoose Model Import
const { Article } = require('../../models/article');
const { Team } = require('../../models/team');
const { Site } = require('../../models/site');

// @route   GET api/articles
// @Desc    Get all articles
// @access  Public
router.get('/', async (req, res) => {
	const articles = await Article.find()
		.populate('publisher', 'name shortName')
		.populate('location', 'name dateline')
		.sort('date: 1');
	res.json(articles);
});

// @route   GET api/articles/id
// @Desc    Get articles by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	const article = await Article.findById(id)
		.populate('publisher', 'name shortName')
		.populate('location', 'name dateline');
	if (article != null) {
		res.json(article);
	}
	else {
		res.status(404).send(`The Article with the ID ${id} was not found!`);
	}
});

// @route   POST api/articles
// @Desc    Create New Article
// @access  Public
router.post('/', async (req, res) => {
	const { publisher, location, headline, articleBody, timestamp, likes, tags, imageSrc, agency } = req.body;
	articleDebugger(`In Article Post, headline ${headline}`);
	const newArticle = new Article(
		{ publisher, location, headline, articleBody, timestamp, likes, tags, imageSrc, agency }
	);

	const convDate = new Date(req.body.date);
	newArticle.date = convDate;

	if (req.body.publisherCode != '') {
		const teamCode = req.body.publisherCode;
		const team = await Team.findOne({ teamCode: teamCode });
		if (!team) {
			articleDebugger(`Publisher Not Found: ${teamCode}`);
		}
		else {
			newArticle.publisher = team._id;
			newArticle.agency = team.shortName;
		}
	}
	else {
		const teamId = req.body.publisher;
		const team = await Team.findById({ teamId });
		if (!team) {
			articleDebugger(`Publisher Not Found: ${teamCode}`);
		}
		else {
			article.agency = team.shortName;
		}
	}

	if (req.body.locationCode != '') {
		const siteCode = req.body.locationCode;
		const site = await Site.findOne({ siteCode: siteCode });
		if (!site) {
			articleDebugger(`Location Not Found: ${siteCode}`);
		}
		else {
			newArticle.location = site._id;
			newArticle.dateline = site.dateline;
		}
	}

	/*
  //no unique key ... just create it
  let { error } = validateArticle(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  */

	const article = await newArticle.save();
	res.json(article);
	console.log(`New Article For Headline ${req.body.headline} created...`);

});

// @route   PUT api/articles/id
// @Desc    Update Existing Article
// @access  Public
router.put('/:id', validateObjectId, async (req, res) => {
	try {
		const id = req.params.id;

		const article = await Article.findByIdAndUpdate(req.params.id,
			{ headline: req.body.headline,
				publisher: req.body.publisher,
				articleBody: req.body.articleBody,
				location: req.body.location,
				timestamp: req.body.timestamp,
				likes: req.body.likes,
				tags: req.body.tags,
				imageSrc: req.body.imageSrc,
				agency: req.body.agency
			},
			{ new: true, omitUndefined: true }
		);

		const convDate = new Date(req.body.date);
		article.date = convDate;

		if (req.body.publisherCode != '') {
			const teamCode = req.body.publisherCode;
			const team = await Team.findOne({ teamCode: teamCode });
			if (!team) {
				articleDebugger(`Publisher Not Found: ${teamCode}`);
			}
			else {
				article.publisher = team._id;
				article.agency = team.shortName;
			}
		}
		else {
			const teamId = req.body.publisher;
			const team = await Team.findById({ teamId });
			if (!team) {
				articleDebugger(`Publisher Not Found: ${teamCode}`);
			}
			else {
				article.agency = team.shortName;
			}
		}

		if (req.body.locationCode != '') {
			const siteCode = req.body.locationCode;
			const site = await Site.findOne({ siteCode: siteCode });
			if (!site) {
				articleDebugger(`Location Not Found: ${siteCode}`);
			}
			else {
				article.location = site._id;
				article.dateline = site.dateline;
			}
		}

		if (article != null) {
			/*
      const { error } = article.validateArticle(req.body);
      if (error) return res.status(400).send(error.details[0].message);
      */
			const updArticle = await article.save();
			res.json(updArticle);
		}
		else {
			res.status(404).send(`The Article with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		console.log(`Article Put Error: ${err.message}`);
		res.status(400).send(`Article Put Error: ${err.message}`);
	}
});

// @route   DELETE api/articles/id
// @Desc    Update Existing Article
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	const article = await Article.findByIdAndRemove(req.params.id);

	if (article != null) {
		res.json(article);
	}
	else {
		res.status(404).send(`The Article with the ID ${id} was not found!`);
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