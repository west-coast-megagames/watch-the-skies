const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');

const auth = require('../../middleware/auth');
const validateObjectId = require('../../middleware/validateObjectId');

// Interceptor Model - Using Mongoose Model
const { Interceptor, validateInterceptor } = require('../../models/ops/interceptor');
const { Aircraft, updateStats } = require('../../models/ops/aircraft');
const { Country } = require('../../models/country'); 
const { Zone } = require('../../models/zone'); 
const { Team } = require('../../models/team'); 
const { BaseSite } = require('../../models/sites/baseSite');
const { System } = require('../../models/ops/systems');
const { loadSystems, systems } = require('../../wts/construction/systems/systems');

// @route   GET api/interceptor
// @Desc    Get all Interceptors
// @access  Public
router.get('/', async function (req, res) {
    //console.log('Sending interceptors somewhere...');
    let interceptors = await Interceptor.find()
      .sort({team: 1})
      .populate('team', 'name shortName')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('systems', 'name category')
      .populate('site', 'name')
      .populate('base', 'name')
    ;
    res.json(interceptors);
});

// @route   GET api/interceptor
// @Desc    Get Interceptors by ID
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
    let id = req.params.id;
    let interceptor = await Interceptor.findById(id)
      .sort({team: 1})
      .populate('team', 'name shortName')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('systems', 'name category')
      .populate('site', 'name')
      .populate('base', 'name')
    ;
    if (interceptor != null) {
      res.json(interceptor);
    } else {
      res.status(404).send(`The Interceptor with the ID ${id} was not found!`);
    } 
});


// @route   POST api/interceptor
// @Desc    Post a new interceptor
// @access  Public
router.post('/', async function (req, res) {

  if (systems.length == 0) {
    await loadSystems();                         // load wts/json/systems.json data into array   
  }
  let { name, team, country, zone, site, stats, zoneCode, teamCode, countryCode, baseCode } = req.body;
  const newInterceptor = new Interceptor(
    { name, team, country, zone, site, stats }
    );
  let docs = await Interceptor.find({ name })
  if (!docs.length) {

    if (zoneCode && zoneCode != ""){
      let zone = await Zone.findOne({ zoneCode: zoneCode });  
      if (!zone) {
        console.log("Interceptor Post Zone Error, New Interceptor:", req.body.name, " Zone: ", req.body.zoneCode);
      } else {
        newInterceptor.zone = zone._id;
      }
    }

    if (teamCode && teamCode != ""){
      let team = await Team.findOne({ teamCode: teamCode });  
      if (!team) {
        console.log("Interceptor Post Team Error, New Interceptor:", req.body.name, " Team: ", req.body.teamCode);
      } else {
        newInterceptor.team = team._id;
      }
    }
      
    if (countryCode && countryCode != ""){
      let country = await Country.findOne({ code: countryCode });  
      if (!country) {
        console.log("Interceptor Post Country Error, New Interceptor:", req.body.name, " Country: ", req.body.countryCode);
      } else {
        newInterceptor.country = country._id;
        newInterceptor.zone    = country.zone;
      }
    }

    if (baseCode && baseCode != "" && baseCode != "undefined" ){
      let baseSite = await BaseSite.findOne({ siteCode: baseCode });  
      if (!baseSite) {
        console.log("Interceptor Post Base Error, New Interceptor:", req.body.name, " Base: ", baseCode);
      } else {
        newInterceptor.base = baseSite._id;
        interceptorLoadDebugger("Interceptor Post Base Found, Interceptor:", req.body.name, " Base: ", baseCode, "Base ID:", baseSite._id);
      }
    }      

    // create systems records for interceptor and store ID in interceptor.system
    if (req.body.loadout && req.body.loadout.length != 0){
      // create systems records for interceptor and store ID in interceptor.system
      newInterceptor.systems = [];
      for (let sys of req.body.loadout) {
        let sysRef = systems[systems.findIndex(system => system.name === sys )];
        if (sysRef) {
          newSystem = await new System(sysRef);
          await newSystem.save(((err, newSystem) => {
            if (err) {
              console.error(`New Interceptor System Save Error: ${err}`);
              res.status(400).send(`Interceptor System Save Error ${name} Error: ${err}`);   
            }
          }));
          newInterceptor.systems.push(newSystem._id);
        } else {
          console.log('Error in creation of system', sys, " for ", name );
        }
      }
    }

    let { error } = validateInterceptor(newInterceptor); 
    if (error) {
      console.log("New Interceptor Validate Error", newInterceptor.name, error.message);
      // remove associated systems records
      for (let j = 0; j < newInterceptor.systems.length; ++j ) {
        sysId = newInterceptor.systems[j];
        let systemDel = await System.findByIdAndRemove(sysId);
        if (systemDel = null) {
          console.log(`The Interceptor System with the ID ${sysId} was not found!`);
        }
      }      
      res.status(400).send(`Interceptor Validate Error ${name} Error: ${error.message}`);   
    }

    let interceptor = await newInterceptor.save();

    interceptor = await Interceptor.findById(interceptor._id)
      .populate('team', 'shortName')
      .populate('systems', 'name category')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('site', 'name')
      .populate('base', 'name');

    updateStats(interceptor._id);
    res.status(200).json(interceptor);
    console.log(`Interceptor ${req.body.name} created...`);
  } else {                
    console.log(`Interceptor already exists: ${name}`);
    res.status(400).send(`Interceptor ${name} already exists!`);
  }
});

// @route   PUT api/interceptor/:id
// @Desc    Update an interceptor
// @access  Public
router.put('/:id', async function (req, res) {
  
  let { error } = validateInterceptor(req.body); 
  if (error) {
    console.log("Update Interceptor Validate Error", req.body.name, error.message);
    res.status(400).send(`Interceptor Validate Error ${name} Error: ${error.message}`);   
  }
  if (systems.length == 0) {
    await loadSystems();                         // load wts/json/systems.json data into array   
  }
  let { name, zoneCode, teamCode, countryCode, baseCode } = req.body;
  let newZone_Id;
  let newTeam_Id;
  let newCountry_Id;
  let newAircraftSystems;
  let newBase_Id;

  const oldInterceptor = await Interceptor.findById({ _id: req.params.id });
  if (oldInterceptor != null ) {
    newZone_Id         = oldInterceptor.zone;
    newTeam_Id         = oldInterceptor.team;
    newCountry_Id      = oldInterceptor.country;
    newAircraftSystems = oldInterceptor.systems;
    newBase_Id         = oldInterceptor.base;
  };

  if (zoneCode && zoneCode != "") {
    let zone = await Zone.findOne({ zoneCode: zoneCode });  
    if (!zone) {
      console.log("Interceptor Put Zone Error, Update Interceptor:", req.body.name, " Zone: ", zoneCode);
    } else {
      newZone_Id  = zone._id;
    }
  } else {
    newZone_Id  = undefined;
  }
    
  if (teamCode && teamCode != "") {
    let team = await Team.findOne({ teamCode: teamCode });  
    if (!team) {
      console.log("Interceptor Put Team Error, Update Interceptor:", req.body.name, " Team: ", teamCode);
    } else {
      newTeam_Id  = team._id;
    }
  } else {
    newTeam_Id  = undefined;
  }

  if (countryCode && countryCode != "") {
    let country = await Country.findOne({ code: countryCode });  
    if (!country) {
      console.log("Interceptor Put Country Error, Update Interceptor:", req.body.name, " Country: ", countryCode);
    } else {
      newCountry_Id  = country._id;
    }
  } else {
    newCountry_Id  = undefined;
  }

  if (baseCode && baseCode != "" && baseCode != "undefined" ){
    let baseSite = await BaseSite.findOne({ siteCode: baseCode });  
    if (!baseSite) {
      console.log("Interceptor Put Base Error, Update Interceptor:", req.body.name, " Base: ", baseCode);
    } else {
      newBase_Id = baseSite._id;
    }
  } else {
    newBase_Id = undefined;
  }

  // create systems records for interceptor and store ID in interceptor.system
  if (req.body.loadout && req.body.loadout.length != 0){
    // create systems records for interceptor and store ID in interceptor.system
    newAircraftSystems = [];
    for (let sys of req.body.loadout) {
      let sysRef = systems[systems.findIndex(system => system.name === sys )];
      if (sysRef) {
        newSystem = await new System(sysRef);
        await newSystem.save(((err, newSystem) => {
          if (err) {
            console.error(`New Interceptor System Save Error: ${err}`);
            res.status(400).send(`Interceptor System Save Error ${name} Error: ${err}`);  
          }
        }));
        newAircraftSystems.push(newSystem._id)
      } else {
        console.log('Error in creation of system', sys, " for ", name );
      }
    }
  }

  let interceptor = await Interceptor.findOneAndUpdate({ _id: req.params.id }, 
    { name,
      zone: newZone_Id,
      country: newCountry_Id,
      team: newTeam_Id,
      base: newBase_Id,
      systems: newAircraftSystems
    }, 
    { new: true,
      omitUndefined: true });

    updateStats(interceptor._id);
    interceptor = await Interceptor.findById(interceptor._id)
      .populate('team', 'shortName')
      .populate('systems', 'name category')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('site', 'name')
      .populate('base', 'name');

    res.status(200).json(interceptor);
    console.log(`Interceptor ${req.params.id} updated...`);
    console.log(`Interceptor named ${interceptor.name}...`);
});

// @route   DELETE api/interceptor/:id
// @Desc    Delete an interceptor
// @access  Public
router.delete('/:id', async function (req, res) {
  let id = req.params.id;
  const interceptor = await Interceptor.findByIdAndRemove(id);
  if (interceptor != null) {
    // remove associated systems records
    for (let j = 0; j < interceptor.systems.length; ++j ) {
      sysId = interceptor.systems[j];
      let systemDel = await System.findByIdAndRemove(sysId);
      if (systemDel = null) {
        console.log(`The Interceptor System with the ID ${sysId} was not found!`);
      }
    }      
    console.log(`${interceptor.name} with the id ${id} was deleted!`);
    res.status(200).send(`${interceptor.name} with the id ${id} was deleted!`);
  } else {
    res.status(400).send(`No interceptor with the id ${id} exists!`);
  }
});

// @route   PATCH api/interceptor/resethull
// @desc    Update all interceptors to max health
// @access  Public
router.patch('/resethull', auth, async function (req, res) {
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

// @route   PATCH api/interceptor/return
// @desc    Update all interceptors to return to base
// @access  Public
router.patch('/return', async function (req, res) {
    for await (const aircraft of Aircraft.find()) {    
        aircraft.status.deployed = false;
        aircraft.status.ready = true;
        console.log(aircraft);
        await aircraft.save();
    }
    res.send("Interceptors succesfully returned!");
    nexusEvent.emit('updateAircrafts');
});

// @route   PATCH api/interceptor/china
// @desc    Update all interceptors to be deployed
// @access  Public
router.patch('/china', async function (req, res) {
    for await (const interceptor of Interceptor.find({ name: /PRC/i })) {    
        interceptor.status.deployed = true;
        await interceptor.save();
    }
    res.send("China's interceptor deployed...");
});

module.exports = router;