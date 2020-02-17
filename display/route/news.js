const express = require('express');

const router = express.Router();

// Article Model - Using Mongoose Model
const { Article } = require('../models/news/article');

// @route   GET api/news/articles
// @Desc    Get all Articles
// @access  Public
router.get('/', async function (req, res) {
    console.log('Gathering all articles!');
    let articles = await Article.find();
    res.json(articles);
});

module.exports = router;