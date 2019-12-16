const express = require('express');
const router = express.Router();
const initLoadAll = require('../../util/dataInit/initLoadAll');

// @route   PATCH api/initData/initAll
// @desc    Init All Data
// @access  Public
router.patch('/initAll', async function (req, res) {

  await initLoadAll();

  res.status(200).send("Init Of Data Done");

});

module.exports = router;