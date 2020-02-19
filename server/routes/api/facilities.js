const routeDebugger = require('debug')('app:routes:facilities');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

const { logger } = require('../../middleware/winston');

// Facility Model - Using Mongoose Model
const { Facility } = require('../../models/gov/facility/facility');
const { Lab } = require('../../models/gov/facility/lab');
const { Factory } = require('../../models/gov/facility/factory');
const { Hanger } = require('../../models/gov/facility/hanger');

// @route   GET api/facilities
// @Desc    Get all facilities
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up all facilities...');
    let facilities = await Facility.find()
      .populate('site', 'name type')
      .populate('team', 'shortName name')
      .populate('research')
      .populate('equipment');

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
    .populate('equipment');

  if (facility != null) {
    res.json(facility);
  } else {
    res.status(404).send(`The facility with the ID ${id} was not found!`);
  } 
});

// @route   GET api/facilities/research
// @Desc    Get all facilities
// @access  Public
router.put('/research', async function (req, res) {
  routeDebugger('Updating facility...');
  let update = req.body;
  //console.log("jeff 1", update);

  let funding =  parseInt(update.funding)
  //console.log(`Funding level jeff 2 ${funding}`)
  
  let facility = await Facility.findById(update._id);
  
  if (!facility){
    res.status(404).send(`The facility with the ID ${update._id} was not found!`);
  } else {
    if (facility.type === "Lab"){
      facility.funding = funding;
      //console.log("jeff 3 ", facility)
    }
  
    facility = await facility.save();
    //console.log("jeff 4", facility)
    res.status(200).json(facility);
  }
});

module.exports = router;