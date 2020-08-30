const routeDebugger = require('debug')('app:routes:facilities');
const express = require('express');
const nexusEvent = require('../../startup/events');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

const { logger } = require('../../middleware/winston');

const { loadBlueprints } = require('../../wts/construction/blueprintLoad');

// Facility Model - Using Mongoose Model
const { Facility } = require('../../models/gov/facility/facility');
const { Site } = require('../../models/sites/site');
const { FacilityBlueprint, Blueprint } = require('../../models/gov/blueprint');
const { find } = require('../../models/logs/alert');


// @route   GET api/facilities
// @Desc    Get all facilities
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up all facilities...');
    let facilities = await Facility.find()
      .populate('site', 'name type')
      .populate('team', 'shortName name sciRate')
      .populate('research')
      .populate('upgrade');

    res.status(200).json(facilities);
});

// @route   GET api/facility
// @Desc    Get Facilities by ID
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
  let id = req.params.id;
  let facility = await Facility.findById(id)
    .sort({team: 1})
    .populate('team', 'name shortName')
    .populate('site', 'name')
    .populate('research')
    .populate('upgrade');

  if (facility != null) {
    res.json(facility);
  } else {
    res.status(404).send(`The facility with the ID ${id} was not found!`);
  } 
});

// @route   POST api/facility
// @Desc    Takes in blueprint and name and site and starts construction on a new Facility
// @access  Public
router.post('/build', async (req, res) => {
  let { name, site, code, team } = req.body; //please give me these things
  await loadBlueprints(); //this can me taken out when you implement the init loadBlueprints
  let blue = await FacilityBlueprint.find();

  let facility = new Facility(blue);
  //console.log(facility);
  //site = await Site.find(site);

  facility.name = name;
  facility.site = site;
  facility.code = code;
  facility.team = team;
  facility = await facility.save();

  res.status(200).json(facility);

});
module.exports = router;