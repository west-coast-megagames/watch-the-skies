const express = require('express'); // Import of EXPRESS to create the router
const restApi = require('../request'); // Import of the request module with a REST api call function.

const router = express.Router(); // Creation of the EXPRESS router

// @route   GET /articles
// @Desc    Get all Articles
// @access  Public
router.get('/', async function (req, res) {
    console.log('Gathering all articles!');
    restApi('https://project-nexus-prototype.herokuapp.com/api/news/articles')
    .then(response => {
        res.json(response)
    })
    .catch(error => {
        res.status(400).send(`Error: ${error}`)
    })
});

// @route   GET /articles/gnn
// @Desc    Get GNN Articles
// @access  Public
router.get('/gnn', async function (req, res) {
    console.log('Gathering articles from GNN!');
    restApi('https://project-nexus-prototype.herokuapp.com/api/news/gnn')
    .then(response => {
        res.json(response)
    })
    .catch(error => {
        res.status(400).send(`Error: ${error}`)
    })
});

// @route   GET /articles/bnc
// @Desc    Get BNC Articles
// @access  Public
router.get('/bnc', async function (req, res) {
    console.log('Gathering articles from BNC!');
    restApi('https://project-nexus-prototype.herokuapp.com/api/news/bnc')
    .then(response => {
        res.json(response)
    })
    .catch(error => {
        res.status(400).send(`Error: ${error}`)
    })
});

module.exports = router;