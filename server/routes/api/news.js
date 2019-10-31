const express = require('express');
const router = express.Router();

// Article Model - Using Mongoose Model
const { Article, validateArticle } = require('../../models/news/article');

// @route   GET api/news/gnn
// @Desc    Get all Articles from GNN
// @access  Public
router.get('/gnn', async function (req, res) {
    console.log('Gathering all articles by GNN!');
    try {
        let articles = await Article.find({ agency: 'GNN' });
        res.json(articles);
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

// @route   GET api/news/bnc
// @Desc    Get all Articles from BNC
// @access  Public
router.get('/bnc', async function (req, res) {
    console.log('Gathering all articles by BNC!');
    try {
        let articles = await Article.find({ agency: 'BNC' });
        res.json(articles);
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

// @route   POST api/news
// @Desc    Post a new article
// @access  Public
router.post('/', async function (req, res) {
    let { agency, turn, date, location, headline, body, imageSrc } = req.body;
    try {
        const { error } = validateArticle(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        let article = new Article(
            { agency, turn, date, location, headline, body, imageSrc }
        );

        article = await article.save();
            console.log(`Article posted by ${agency}...`);
            return res.json(article);            

    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

// @route   PUT api/news/:id
// @Desc    Update an article
// @access  Public
router.put('/:id', async function (req, res) {
    let { agency, turn, date, location, headline, body, imageSrc } = req.body;
    try {
        const article = await Article.findOneAndUpdate({ _id: req.params.id }, { agency, turn, date, location, headline, body, imageSrc }, { new: true });
        res.json(article);
        console.log(`Article: ${headline} updated...`);
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

// @route   DELETE api/news/:id
// @Desc    Delete an article
// @access  Public
router.delete('/:id', async function (req, res) {
    let id = req.params.id;
    try {
        const article = await Article.findByIdAndRemove(id);
        if (article != null) {
            console.log(`${article.headline} with the id ${id} was deleted!`);
            res.send(`${article.headline} with the id ${id} was deleted!`);
        } else {
            res.send(`No article with the id ${id} exists!`);
        }
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

module.exports = router;