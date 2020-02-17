const express = require('express');
const router = express.Router();

// @route   GET /
// @Desc    Welcome
// @access  Public
router.get('/', async function (req, res) {
    console.log('Someone tried to visit the app landing page!');
    res.send('Welcome to the West Coast Megagames display app, Testing, testing, read all about it!');
});

module.exports = router;