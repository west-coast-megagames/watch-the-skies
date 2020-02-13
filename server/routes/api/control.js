const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');

// Interceptor Model - Using Mongoose Model
const { Interceptor, validateInterceptor } = require('../../models/ops/interceptor');
const { Aircraft, updateStats } = require('../../models/ops/aircraft');
const { System } = require('../../models/ops/systems');
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
    let interceptors = await Interceptor.find().populate('team');
    interceptors = interceptors.filter(i => i.team.teamType === 'A')
    for await (const interceptor of interceptors) {
        console.log(interceptor);
        if (interceptor.status.deployed === false) {
            count++
            interceptor.status.deployed = true;
            await interceptor.save();    
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
// @desc    Update all interceptors to be not be deployed
// @access  Public
router.patch('/alien/return', async function (req, res) {
    let count = 0;
    let interceptors = await Interceptor.find().populate('team');
    interceptors = interceptors.filter(i => i.team.teamType === 'A')
    for await (const interceptor of interceptors) {
        if (interceptor.status.deployed === true) {
        count++
        interceptor.status.deployed = false;
        await interceptor.save();
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
// @desc    Update all interceptors to max health
// @access  Public
router.patch('/resethull', async function (req, res) {
    for await (const interceptor of Interceptor.find()) {    
        console.log(`${interceptor.name} has ${interceptor.stats.hull} hull points`);
        interceptor.stats.hull = interceptor.stats.hullMax;
        interceptor.status.destroyed = false;
        console.log(`${interceptor.name} now has ${interceptor.stats.hull} hull points`);
        await interceptor.save();
    }
    res.send("Interceptors succesfully reset!");
    nexusEvent.emit('updateAircrafts');
});

// @route   PATCH api/control/loadSystems
// @desc    Loads all systems into game server
// @access  Public
router.patch('/loadSystems', async function (req, res) {
    let response = await loadSystems();
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
  let docs = await Interceptor.find({ name: aircraft.name });
  if (!docs.length) {
    // no ... add
    aircraft.systems = [];
    for (let sys of aircraft.loadout) {
      let sysRef = systems[systems.findIndex(system => system.name === sys )];
      if (sysRef) {
        newSystem = await new System(sysRef);
        await newSystem.save(((err, newSystem) => {
          if (err) return console.error(`Post Build Interceptor System Save Error: ${err}`);
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
        console.log("Interceptor Build Zone Error, New Interceptor:", req.body.name, " Zone: ", req.body.zoneCode);
      } else {
        newZone_Id = zone._id;
      }
    }
  
    if (aircraft.teamCode && aircraft.teamCode != ""){
      let team = await Team.findOne({ teamCode: aircraft.teamCode });  
      if (!team) {
        console.log("Interceptor Build Team Error, New Interceptor:", req.body.name, " Team: ", req.body.teamCode);
      } else {
        aircraft.team = team._id;
      }
    }
        
    if (aircraft.countryCode && aircraft.countryCode != ""){
      let country = await Country.findOne({ code: aircraft.countryCode });  
      if (!country) {
        console.log("Interceptor Build Country Error, New Interceptor:", req.body.name, " Country: ", req.body.countryCode);
      } else {
        newCountry_Id = country._id;
      }
    }

    if (aircraft.baseCode && aircraft.baseCode != "" && aircraft.baseCode != "undefined" ){
      let baseSite = await BaseSite.findOne({ siteCode: aircraft.baseCode });  
      if (!baseSite) {
        console.log("Interceptor Build Base Error, New Interceptor:", req.body.name, " Base: ", req.body.baseCode);
      } else {
        aircraft.base = baseSite._id;
      }
    }      

    let { error } = validateInterceptor(aircraft); 
    if (error) {
      console.log("New Interceptor Validate Error", aircraft.name, error.message);
      // remove associated systems records
      for (let j = 0; j < aircraft.systems.length; ++j ) {
        sysId = aircraft.systems[j];
        let systemDel = await System.findByIdAndRemove(sysId);
        if (systemDel = null) {
          console.log(`The Interceptor System with the ID ${sysId} was not found!`);
        }
      }      
      return res.status(400).send(`Interceptor Validate Error ${aircraft.name} Error: ${error.message}`);   
    }
    
    let newInterceptor = new Interceptor(aircraft);
    newInterceptor.country = newCountry_Id;
    newInterceptor.zone    = newZone_Id;
    newInterceptor = await newInterceptor.save();
    newInterceptor = await Interceptor.findById(newInterceptor._id)
      .populate('team', 'shortName')
      .populate('systems', 'name category')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('base', 'baseName');
    await updateStats(newInterceptor._id);
    
    //console.log(newInterceptor);
   
    res.status(200).send(newInterceptor);
  } else {
    console.log(`Interceptor already exists (control post build): ${aircraft.name}`);
    res.status(400).send(`Interceptor ${aircraft.name} already exists!`);        
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