const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

// @route   GET /
// @Desc    Welcome
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Someone tried to visit the app landing page!');
    res.send('Welcome to the West Coast Megagames app, you will need to know your endpoints to get anything. Contact John Cleveland for more information!');
});

module.exports = router;