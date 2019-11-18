const {Zone, validateZone} = require('../../models/zone');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const zoneDebugger = require('debug')('app:zone');
const supportsColor = require('supports-color');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// @route   GET api/zones
// @Desc    Get all Active zones
// @access  Public
router.get('/', async (req, res) => {
    try {
        let zones = await Zone.find().sort('zoneCode: 1');
        res.json(zones);
      } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
      } 
});

// @route   GET api/zones/all
// @Desc    Get all zones
// @access  Public
//does not have to be active here
router.get('/all', async (req, res) => {
    try {
      let zones = await Zone.find().sort({zoneCode: 1});
      res.json(zones);
    } catch (err) {
      console.log(`Error: ${err.message}`);
      res.status(400).send(`Error: ${err.message}`);
    } 
  });


// @route   GET api/zones/id
// @Desc    Get zones by id
// @access  Public
router.get('/id/:id', async (req, res) => {

    let id = req.params.id;
    try {
        const zone = await Zone.findById(id);
        if (zone != null) {
          res.json(zone);
        } else {
          res.status(404).send(`The Zone with the ID ${id} was not found!`);
        }
    } catch (err) {
      console.log(`Error: ${err.message}`);
      res.status(400).send(`Error: ${err.message}`);
    }
});

// @route   GET api/zones/code
// @Desc    Get Zones by Zone Code
// @access  Public
router.get('/code/:zoneCode', async (req, res) => {
    let zoneCode = req.params.zoneCode;
    try {
      let zone = await Zone.find({ zoneCode });
      if (zone.length) {
        res.json(zone);
      } else {
        res.status(404).send(`The Zone with the Zone Code ${zoneCode} was not found!`);
      }
    } catch (err) {
      console.log(`Error: ${err.message}`);
      res.status(400).send(`Error: ${err.message}`);
    }
  });

// @route   POST api/zones
// @Desc    Create New Zone
// @access  Public
router.post('/', async (req, res) => {
  let { zoneCode, zoneName } = req.body;
  zoneDebugger("In Zone Post ... Code: ", zoneCode, "Name: ", zoneName);
  const newZone = new Zone(
      { zoneCode, zoneName }
  );
  try {
      let docs = await Zone.find({ zoneCode })
      if (!docs.length) {
        
          let { error } = validateZone(req.body); 
          if (error) return res.status(400).send(error.details[0].message);

          let zone = await newZone.save();
          res.json(zone);
          console.log(`New Zone ${req.body.zoneCode} created...`);
      } else {                
          console.log(`Zone Code already exists: ${zoneCode}`);
          res.status(400).send(`Zone Code ${zoneCode} already exists!`);
      }
  } catch (err) {
      console.log(`Error: ${err.message}`);
      res.status(400).send(`Error: ${err.message}`);
  }
  });
  
// @route   PUT api/zones/id
// @Desc    Update Existing Zone
// @access  Public  
router.put('/:id', async (req, res) => {
    let id = req.params.id;
    zoneDebugger("In Zone Put ... Code: ", req.params.zoneCode, "Name: ", req.params.zoneName);
    try {
        const zone = await Zone.findByIdAndUpdate({ _id: req.params.id },
          { zoneName: req.body.zoneName,
            zoneCode: req.body.zoneCode }, 
          { new: true }
          );

        if (zone != null) {
          const { error } = zone.validateZone(req.body); 
          if (error) return res.status(400).send(error.details[0].message);
          res.json(zone);
        } else {
          res.status(404).send(`The Zone with the ID ${id} was not found!`);
        }
    } catch (err) {
      console.log(`Error: ${err.message}`);
      res.status(400).send(`Error: ${err.message}`);
    }
 });
  
// @route   DELETE api/zones/id
// @Desc    Update Existing Zone
// @access  Public   
router.delete('/:id', async (req, res) => {

    let id = req.params.id;
    try {
        const zone = await Zone.findByIdAndRemove(req.params.id);
  
        if (zone != null) {
          res.json(zone);
        } else {
          res.status(404).send(`The Zone with the ID ${id} was not found!`);
        } 
    } catch (err) {
      console.log(`Error: ${err.message}`);
      res.status(400).send(`Error: ${err.message}`);
    }        
});

// @route   PATCH api/zones/deleteAll
// @desc    Delete All Zones
// @access  Public
router.patch('/deleteAll', async function (req, res) {
  try {
      for await (const zone of Zone.find()) {    
        let id = zone.id;
        try {
          const zoneDel = await Zone.findByIdAndRemove(id);
          if (zoneDel = null) {
            res.status(404).send(`The Zone with the ID ${id} was not found!`);
          }
        } catch (err) {
          console.log('Error:', err.message);
          res.status(400).send(err.message);
        }
      }        
      res.status(200).send("All Zones succesfully deleted!");
  } catch (err) {
      console.log(`Error: ${err.message}`);
      res.status(400).send(`Error: ${err.message}`);
  };
});

module.exports = router;