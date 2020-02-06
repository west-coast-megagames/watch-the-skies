const routeDebugger = require('debug')('app:routes - sites');
const express = require('express');
const router = express.Router();

const { logger } = require('../../middleware/winston');

// Interceptor Model - Using Mongoose Model
const { Site } = require('../../models/sites/site')

// @route   GET api/sites
// @Desc    Get all sites
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up all sites...');
    let sites = await Site.find().populate('country', 'name').populate('team').sort({team: 1});
    res.status(200).json(sites);
});

module.exports = router;