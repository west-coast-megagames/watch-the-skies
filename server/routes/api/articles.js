const {Article, validateArticle} = require('../../models/news/article');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const articleDebugger = require('debug')('app:article');
const supportsColor = require('supports-color');
const validateObjectId = require('../../middleware/validateObjectId');
const {Team} = require('../../models/team/team'); 
const {Site} = require('../../models/sites/site'); 

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// @route   GET api/articles
// @Desc    Get all articles
// @access  Public
router.get('/', async (req, res) => {
  let articles = await Article.find()
                            .populate('team', 'name')
                            .populate('location', 'name')
                            .sort('date: 1');
  res.json(articles);
});

// @route   GET api/articles/id
// @Desc    Get articles by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
  let id = req.params.id;
  const article = await Article.findById(id)
                             .populate('team', 'name')
                             .populate('location', 'name');
  if (article != null) {
    res.json(article);
  } else {
    res.status(404).send(`The Article with the ID ${id} was not found!`);
  }
});

// @route   GET api/articles/code
// @Desc    Get Articles by Article Code
// @access  Public
router.get('/agency/:agency', async (req, res) => {
  let agency = req.params.agency;
  let article = await Article.find({ "agency": agency })
                         .populate('team', 'name')
                         .populate('location', 'name');
  if (article.length) {
    res.json(article);
  } else {
    res.status(404).send(`The Article(s) with the Article Agency ${agency} was not found!`);
  }
});

// @route   POST api/articles
// @Desc    Create New Article
// @access  Public
router.post('/', async (req, res) => {
  let { agency, location, headline, body } = req.body;
  articleDebugger("In Article Post ... agency: ", agency, "Location: ", location);
  const newArticle = new Article(
      { agency, headline, body }
  );
    
  //no unique key ... just create it    
  let { error } = validateArticle(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let article = await newArticle.save();
  res.json(article);
  console.log(`New Article For Agency ${req.body.agency} created...`);

  });
  
// @route   PUT api/articles/id
// @Desc    Update Existing Article
// @access  Public  
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    let id = req.params.id;

    const article = await Article.findByIdAndUpdate( req.params.id,
      { headline: req.body.headline,
        agency: req.body.agency,
        body: req.body.body }, 
      { new: true, omitUndefined: true }
    );

    if (article != null) {
      const { error } = article.validateArticle(req.body); 
      if (error) return res.status(400).send(error.details[0].message);
        res.json(article);
    } else {
        res.status(404).send(`The Article with the ID ${id} was not found!`);
    }
  } catch (err) {
      console.log(`Article Put Error: ${err.message}`);
      res.status(400).send(`Article Put Error: ${err.message}`);
    }
});
  
// @route   DELETE api/articles/id
// @Desc    Update Existing Article
// @access  Public   
router.delete('/:id', validateObjectId, async (req, res) => {
  let id = req.params.id;
  const article = await Article.findByIdAndRemove(req.params.id);

  if (article != null) {
    res.json(article);
  } else {
    res.status(404).send(`The Article with the ID ${id} was not found!`);
  } 
});

// @route   PATCH api/articles/deleteAll
// @desc    Delete All Articles
// @access  Public
router.patch('/deleteAll', async function (req, res) {
  for await (const article of Article.find()) {    
    let id = article.id;
    try {
      articleDel = await Article.findByIdAndRemove(id);
      if (articleDel = null) {
        res.status(404).send(`The Article with the ID ${id} was not found!`);
      }
    } catch (err) {
      console.log('Error:', err.message);
      res.status(400).send(err.message);
    }
  }        
  res.status(200).send("All Articles succesfully deleted!");
});

module.exports = router;