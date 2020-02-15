const routeDebugger = require('debug')('app:routes - facilities');
const express = require('express');
const router = express.Router();

const { logger } = require('../../middleware/winston');

// Facility Model - Using Mongoose Model
const { Facility } = require('../../models/gov/facility/facility');

// @route   GET api/facilities
// @Desc    Get all facilities
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up all facilities...');
    let facilities = await Facility.find()
      .populate('site', 'name type')
      .populate('team', 'shortName name');

    res.status(200).json(facilities);
});

module.exports = router;