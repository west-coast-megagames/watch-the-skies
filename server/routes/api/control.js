const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');

// Aircraft Model - Using Mongoose Model
const { Aircraft, updateStats, validateAircraft } = require('../../models/ops/aircraft');
const { System } = require('../../models/gov/equipment/systems');
const { loadSystems, systems } = require('../../wts/construction/systems/systems');
const { Country } = require('../../models/country'); 
const { Zone } = require('../../models/zone'); 
const { Team } = require('../../models/team'); 
const { BaseSite } = require('../../models/sites/baseSite');

// @route   PATCH api/control/alien/deploy
// @desc    Update all alien crafts to be deployed
// @access  Public
router.patch('/alien/deploy', async function (req, res) {
    let count = 0;
    let aircrafts = await Aircraft.find().populate('team');
    aircrafts = aircrafts.filter(i => i.team.teamType === 'A')
    for await (const aircraft of aircrafts) {
        console.log(aircraft);
        if (aircraft.status.deployed === false) {
            count++
            aircraft.status.deployed = true;
            await aircraft.save();    
        }
    }
    if (count === 0) {
        res.status(200).send(`No alien crafts availible to deployed...`);
    } else {
        res.status(200).send(`${count} alien crafts have been deployed...`);
    }

    nexusEvent.emit('updateAircrafts');
});


// @route   PATCH api/control/alien/return
// @desc    Update all aircrafts to be not be deployed
// @access  Public
router.patch('/alien/return', async function (req, res) {
    let count = 0;
    let aircrafts = await Aircraft.find().populate('team');
    aircrafts = aircrafts.filter(i => i.team.teamType === 'A')
    for await (const aircraft of aircrafts) {
        if (aircraft.status.deployed === true) {
        count++
        aircraft.status.deployed = false;
        await aircraft.save();
        }
    }
    if (count === 0) {
        res.status(200).send(`No alien crafts availible to return to base...`);
    } else {
        res.status(200).send(`${count} alien crafts have returned to base...`);
    }
    nexusEvent.emit('updateAircrafts');
});

// @route   PATCH api/control/resethull
// @desc    Update all aircrafts to max health
// @access  Public
router.patch('/resethull', async function (req, res) {
    for await (const aircraft of Aircraft.find()) {    
        console.log(`${aircraft.name} has ${aircraft.stats.hull} hull points`);
        aircraft.stats.hull = aircraft.stats.hullMax;
        aircraft.status.destroyed = false;
        console.log(`${aircraft.name} now has ${aircraft.stats.hull} hull points`);
        await aircraft.save();
    }
    res.send("Aircrafts succesfully reset!");
    nexusEvent.emit('updateAircrafts');
});

// @route   PATCH api/control/loadSystems
// @desc    Loads all systems into game server
// @access  Public
router.patch('/loadSystems', async function (req, res) {
    let response = await loadSystems();
    res.status(200).send(response);
});

// @route   GET api/control/salvage
// @desc    Sends all systems marked for salvage
// @access  Public
router.get('/salvage', async function (req, res) {
  let response = await System.find({'status.salvage': true});
  res.status(200).send(response);
});


// @route   POST api/control/build
// @desc    Builds the thing!
// @access  Public
router.post('/build', async function (req, res) {
  
  if (systems.length == 0) {
    await loadSystems();                         // load wts/json/systems.json data into array   
  }

  let newCountry_Id;
  let newZone_Id;
  let aircraft = req.body;
    
  // does one already exist with this name?
  let docs = await Aircraft.find({ name: aircraft.name });
  if (!docs.length) {
    // no ... add
    aircraft.systems = [];
    for (let sys of aircraft.loadout) {
      let sysRef = systems[systems.findIndex(system => system.name === sys )];
      if (sysRef) {
        newSystem = await new System(sysRef);
        await newSystem.save(((err, newSystem) => {
          if (err) return console.error(`Post Build Aircraft System Save Error: ${err}`);
        }));
        console.log(newSystem);
        aircraft.systems.push(newSystem._id);
      } else {
        console.log('Error in creation of system', sys);
      }
    }

    if (aircraft.zoneCode && aircraft.zoneCode != ""){
      let zone = await Zone.findOne({ zoneCode: aircraft.zoneCode });  
      if (!zone) {
        console.log("Aircraft Build Zone Error, New Aircraft:", req.body.name, " Zone: ", req.body.zoneCode);
      } else {
        newZone_Id = zone._id;
      }
    }
  
    if (aircraft.teamCode && aircraft.teamCode != ""){
      let team = await Team.findOne({ teamCode: aircraft.teamCode });  
      if (!team) {
        console.log("Aircraft Build Team Error, New Aircraft:", req.body.name, " Team: ", req.body.teamCode);
      } else {
        aircraft.team = team._id;
      }
    }
        
    if (aircraft.countryCode && aircraft.countryCode != ""){
      let country = await Country.findOne({ code: aircraft.countryCode });  
      if (!country) {
        console.log("Aircraft Build Country Error, New Aircraft:", req.body.name, " Country: ", req.body.countryCode);
      } else {
        newCountry_Id = country._id;
      }
    }

    if (aircraft.baseCode && aircraft.baseCode != "" && aircraft.baseCode != "undefined" ){
      let baseSite = await BaseSite.findOne({ siteCode: aircraft.baseCode });  
      if (!baseSite) {
        console.log("Aircraft Build Base Error, New Aircraft:", req.body.name, " Base: ", req.body.baseCode);
      } else {
        aircraft.baseOrig = baseSite._id;
      }
    }      

    let { error } = validateAircraft(aircraft); 
    if (error) {
      console.log("New Aircraft Validate Error", aircraft.name, error.message);
      // remove associated systems records
      for (let j = 0; j < aircraft.systems.length; ++j ) {
        sysId = aircraft.systems[j];
        let systemDel = await System.findByIdAndRemove(sysId);
        if (systemDel = null) {
          console.log(`The Aircraft System with the ID ${sysId} was not found!`);
        }
      }      
      return res.status(400).send(`Aircraft Validate Error ${aircraft.name} Error: ${error.message}`);   
    }
    
    let newAircraft = new Aircraft(aircraft);
    newAircraft.country = newCountry_Id;
    newAircraft.zone    = newZone_Id;
    newAircraft = await newAircraft.save();
    newAircraft = await Aircraft.findById(newAircraft._id)
      .populate('team', 'shortName')
      .populate('systems', 'name category')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('base', 'baseName');
    await updateStats(newAircraft._id);
    
    //console.log(newAircraft);
   
    res.status(200).send(newAircraft);
  } else {
    console.log(`Aircraft already exists (control post build): ${aircraft.name}`);
    res.status(400).send(`Aircraft ${aircraft.name} already exists!`);        
  }
});

// @route   PATCH api/control/update aircraft
// @desc    Builds the thing!
// @access  Public
router.patch('/updateAircraft', async function (req, res) {
    count = 0;
    for (let aircraft of await Aircraft.find().populate('systems')) {
        await updateStats(aircraft._id);
        count++;
    };
    
    res.status(200).send(`${count} aircraft updated...`);
});

module.exports = router;