const routeDebugger = require('debug')('app:routes:facilities');
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
      .populate('team', 'shortName name')
      .populate('research');

    res.status(200).json(facilities);
});

// @route   GET api/facilities/research
// @Desc    Get all facilities
// @access  Public
router.put('/research', async function (req, res) {
  routeDebugger('Updating facility...');
  let update = req.body;
  console.log(update);
  let facility = await Facility.findById(update._id);
  facility.funding = update.funding;
  facility.research = update.research;
  facility.markModified('funding');
  facility.markModified('research');
  facility = await facility.save();
  console.log(facility);
  res.status(200).json(facility);
});

module.exports = router;