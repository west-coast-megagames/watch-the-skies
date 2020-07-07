const express = require('express');
const router = express.Router();
const routeDebugger = require('debug')('app:routes:tableau');

// Aircraft Model - Using Mongoose Model
const { Aircraft, validateAircraft, updateStats } = require('../../models/ops/aircraft');

// @route   GET api/aircraft
// @Desc    Get all Aircrafts
// @access  Public
router.get('/aircraft', async function (req, res) {
    //console.log('Sending aircrafts somewhere...');
    let aircrafts = await Aircraft.find()
        .select('-systems -stats -status')
        .sort({team: 1})
        .populate('team', 'name shortName')
        .populate('zone', 'zoneName')
        .populate('country', 'name')
        .populate('site')
        .populate('baseOrig');
    res.json(aircrafts);
});

module.exports = router