const {LogError, validateLogError} = require('../../models/loggers/logError');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const logErrorDebugger = require('debug')('app:logError');
const supportsColor = require('supports-color');
const validateObjectId = require('../../middleware/validateObjectId');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// @route   GET api/logError
// @Desc    Get all logError
// @access  Public
router.get('/', async (req, res) => {
  let logErrors = await LogError.find()
                                .sort('timestamp');
  res.json(logErrors);
});

// @route   GET api/logErrors/id
// @Desc    Get logErrors by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
  let id = req.params.id;
  const logError = await LogError.findById(id)
                                     .sort('timestamp');
  if (logError != null) {
    res.json(logError);
  } else {
    res.status(404).send(`The LogError with the ID ${id} was not found!`);
  }
});


// @route   PATCH api/logErrors/deleteAll
// @desc    Delete All LogErrors
// @access  Public
router.patch('/deleteAll', async function (req, res) {
    for await (const logError of LogError.find()) {    
      let id = logError.id;
      try {
        logErrorDel = await LogError.findByIdAndRemove(id);
        if (logErrorDel = null) {
          res.status(404).send(`The LogError with the ID ${id} was not found!`);
        }
      } catch (err) {
        console.log('Error:', err.message);
        res.status(400).send(err.message);
      }
    }        
    res.status(200).send("All LogErrors succesfully deleted!");
});

module.exports = router;