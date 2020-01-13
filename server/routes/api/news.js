const { getTimeRemaining } = require('../../wts/gameClock/gameClock')

const routeDebugger = require('debug')('app:routes');
const express = require('express');

const router = express.Router();

// Article Model - Using Mongoose Model
const { Article, validateArticle } = require('../../models/news/article');

// @route   GET api/news/gnn
// @Desc    Get all Articles from GNN
// @access  Public
router.get('/gnn', async function (req, res) {
    routeDebugger('Gathering all articles by GNN!');
    let articles = await Article.find({ agency: 'GNN' });
    res.json(articles);
});

// @route   GET api/news/bnc
// @Desc    Get all Articles from BNC
// @access  Public
router.get('/bnc', async function (req, res) {
    routeDebugger('Gathering all articles by BNC!');
    let articles = await Article.find({ agency: 'BNC' });
    res.json(articles);
});

// @route   POST api/news
// @Desc    Post a new article
// @access  Public
router.post('/', async function (req, res) {
    let { agency, turn, date, location, headline, body, imageSrc } = req.body;
    const { error } = validateArticle(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let gameTime = getTimeRemaining();

    let timestamp = {
        turn: gameTime.turn,
        phase: gameTime.phase,
        date: Date.now()
    }
    
    let article = new Article(
        { agency, timestamp, location, headline, body, imageSrc }
    );

    article = await article.save();
        console.log(`Article posted by ${agency}...`);
        return res.json(article);            
});

// @route   PUT api/news/:id
// @Desc    Update an article
// @access  Public
router.put('/:id', async function (req, res) {
    let { agency, turn, date, location, headline, body, imageSrc } = req.body;
    const article = await Article.findOneAndUpdate({ _id: req.params.id }, { agency, turn, date, location, headline, body, imageSrc }, { new: true });
    res.json(article);
    routeDebugger(`Article: ${headline} updated...`);
});

// @route   DELETE api/news/:id
// @Desc    Delete an article
// @access  Public
router.delete('/:id', async function (req, res) {
    let id = req.params.id;
    const article = await Article.findByIdAndRemove(id);
    if (article != null) {
        routeDebugger(`${article.headline} with the id ${id} was deleted!`);
        res.status(200).send(`${article.headline} with the id ${id} was deleted!`);
    } else {
        res.status(400).send(`No article with the id ${id} exists!`);
    }
});

module.exports = router;