const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');
const routeDebugger = require('debug')('app:routes:interceptor');
const auth = require('../../middleware/auth');
const validateObjectId = require('../../middleware/validateObjectId');

// Aircraft Model - Using Mongoose Model
const { Aircraft, validateAircraft, updateStats } = require('../../models/ops/aircraft');
const { Country } = require('../../models/country'); 
const { Zone } = require('../../models/zone'); 
const { Team } = require('../../models/team/team'); 
const { BaseSite } = require('../../models/sites/site');
const { System } = require('../../models/gov/equipment/systems');
const { loadSystems, systems, validUnitType } = require('../../wts/construction/systems/systems');

// @route   GET api/aircraft
// @Desc    Get all Aircrafts
// @access  Public
router.get('/', async function (req, res) {
    //console.log('Sending aircrafts somewhere...');
    let aircrafts = await Aircraft.find()
      .sort({team: 1})
      .populate('team', 'name shortName')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('systems', 'name category')
      .populate('site', 'name')
      .populate('baseOrig', 'name')
    ;
    res.json(aircrafts);
});

// @route   PUT api/aircraft/repair
// @desc    Update aircraft to max health
// @access  Public
router.put('/repair', async function (req, res) {
  let aircraft = await Aircraft.findById(req.body._id);
  console.log(req.body);
  let account = await Account.findOne({ name: 'Operations', 'team': aircraft.team });
  if (account.balance < 2) {
    res.status(402).send(`No Funding! Assign more money to your operations account to repair ${aircraft.name}.`)
  } else {
    account = await banking.withdrawal(account, 2, `Repairs for ${aircraft.name}`);
    await account.save();
    modelDebugger(account)

    aircraft.status.repair = true;
    aircraft.ready = false;
    await aircraft.save();

    res.status(200).send(`${Aircraft.name} put in for repairs...`);
    nexusEvent.emit('updateAircrafts');
  }
});

// @route   GET api/aircraft
// @Desc    Get Aircrafts by ID
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
    let id = req.params.id;
    let aircraft = await Aircraft.findById(id)
      .sort({team: 1})
      .populate('team', 'name shortName')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('systems', 'name category')
      .populate('site', 'name')
      .populate('base', 'name')
    ;
    if (aircraft != null) {
      res.json(aircraft);
    } else {
      res.status(404).send(`The Aircraft with the ID ${id} was not found!`);
    } 
});


// @route   POST api/aircraft
// @Desc    Post a new aircraft
// @access  Public
router.post('/', async function (req, res) {

  if (systems.length == 0) {
    await loadSystems();                         // load wts/json/systems.json data into array   
  }
  let { name, team, country, zone, baseOrig, stats, status, zoneCode, teamCode, countryCode, baseCode } = req.body;
  const newAircraft = new Aircraft(
    { name, team, country, zone, baseOrig, stats, status }
    );
  newAircraft.type = req.body.type;
  let docs = await Aircraft.find({ name })
  if (!docs.length) {

    if (zoneCode && zoneCode != ""){
      let zone = await Zone.findOne({ zoneCode: zoneCode });  
      if (!zone) {
        console.log("Aircraft Post Zone Error, New Aircraft:", req.body.name, " Zone: ", req.body.zoneCode);
      } else {
        newAircraft.zone = zone._id;
      }
    }

    if (teamCode && teamCode != ""){
      let team = await Team.findOne({ teamCode: teamCode });  
      if (!team) {
        console.log("Aircraft Post Team Error, New Aircraft:", req.body.name, " Team: ", req.body.teamCode);
      } else {
        newAircraft.team = team._id;
      }
    }
      
    if (countryCode && countryCode != ""){
      let country = await Country.findOne({ code: countryCode });  
      if (!country) {
        console.log("Aircraft Post Country Error, New Aircraft:", req.body.name, " Country: ", req.body.countryCode);
      } else {
        newAircraft.country = country._id;
        newAircraft.zone    = country.zone;
      }
    }

    if (baseCode && baseCode != "" && baseCode != "undefined" ){
      let baseSite = await BaseSite.findOne({ siteCode: baseCode });  
      if (!baseSite) {
        console.log("Aircraft Post Base Error, New Aircraft:", req.body.name, " Base: ", baseCode);
      } else {
        newAircraft.baseOrig = baseSite._id;
        routeDebugger("Aircraft Post Base Found, Aircraft:", req.body.name, " Base: ", baseCode, "Base ID:", baseSite._id);
      }
    }      

    // create systems records for aircraft and store ID in aircraft.system
    if (req.body.loadout && req.body.loadout.length != 0){
      // create systems records for aircraft and store ID in aircraft.system
      newAircraft.systems = [];
      for (let sys of req.body.loadout) {
        let sysRef = systems[systems.findIndex(system => system.code === sys )];
        if (sysRef) {
          if (validUnitType(sysRef.unitType, NewAircraft.type))  {
            newSystem = await new System(sysRef);
            newSystem.unitType = newAircraft.type;
            await newSystem.save(((err, newSystem) => {
              if (err) {
                console.error(`New Aircraft System Save Error: ${err}`);
                res.status(400).send(`Aircraft System Save Error ${name} Error: ${err}`);   
              }
            }));
            newAircraft.systems.push(newSystem._id);
          } else {
            console.log('Error in creation of system - wrong UnitType', sys, " for ", name );
          }
        } else {
          console.log('Error in creation of system', sys, " for ", name );
        }
      }
    }

    let { error } = validateAircraft(newAircraft); 
    if (error) {
      console.log("New Aircraft Validate Error", newAircraft.name, error.message);
      // remove associated systems records
      for (let j = 0; j < newAircraft.systems.length; ++j ) {
        sysId = newAircraft.systems[j];
        let systemDel = await System.findByIdAndRemove(sysId);
        if (systemDel = null) {
          console.log(`The Aircraft System with the ID ${sysId} was not found!`);
        }
      }      
      res.status(400).send(`Aircraft Validate Error ${name} Error: ${error.message}`);   
    }

    let aircraft = await newAircraft.save();

    aircraft = await Aircraft.findById(aircraft._id)
      .populate('team', 'shortName')
      .populate('systems', 'name category')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('site', 'name')
      .populate('baseOrig', 'name');

    updateStats(aircraft._id);
    res.status(200).json(aircraft);
    console.log(`Aircraft ${req.body.name} created...`);
  } else {                
    console.log(`Aircraft already exists: ${name}`);
    res.status(400).send(`Aircraft ${name} already exists!`);
  }
});

// @route   PUT api/aircraft/:id
// @Desc    Update an aircraft
// @access  Public
router.put('/:id', async function (req, res) {
  
  let { error } = validateAircraft(req.body); 
  if (error) {
    console.log("Update Aircraft Validate Error", req.body.name, error.message);
    res.status(400).send(`Aircraft Validate Error ${name} Error: ${error.message}`);   
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
  let newType;

  const oldAircraft = await Aircraft.findById({ _id: req.params.id });
  if (oldAircraft != null ) {
    newZone_Id         = oldAircraft.zone;
    newTeam_Id         = oldAircraft.team;
    newCountry_Id      = oldAircraft.country;
    newAircraftSystems = oldAircraft.systems;
    newBase_Id         = oldAircraft.baseOrig;
    newType            = oldAircraft.type;
  };

  if (req.body.type && req.body.type != "") {
    newType = req.body.type;
  }
  if (zoneCode && zoneCode != "") {
    let zone = await Zone.findOne({ zoneCode: zoneCode });  
    if (!zone) {
      console.log("Aircraft Put Zone Error, Update Aircraft:", req.body.name, " Zone: ", zoneCode);
    } else {
      newZone_Id  = zone._id;
    }
  } else {
    newZone_Id  = undefined;
  }
    
  if (teamCode && teamCode != "") {
    let team = await Team.findOne({ teamCode: teamCode });  
    if (!team) {
      console.log("Aircraft Put Team Error, Update Aircraft:", req.body.name, " Team: ", teamCode);
    } else {
      newTeam_Id  = team._id;
    }
  } else {
    newTeam_Id  = undefined;
  }

  if (countryCode && countryCode != "") {
    let country = await Country.findOne({ code: countryCode });  
    if (!country) {
      console.log("Aircraft Put Country Error, Update Aircraft:", req.body.name, " Country: ", countryCode);
    } else {
      newCountry_Id  = country._id;
    }
  } else {
    newCountry_Id  = undefined;
  }

  if (baseCode && baseCode != "" && baseCode != "undefined" ){
    let baseSite = await BaseSite.findOne({ siteCode: baseCode });  
    if (!baseSite) {
      console.log("Aircraft Put Base Error, Update Aircraft:", req.body.name, " Base: ", baseCode);
    } else {
      newBase_Id = baseSite._id;
    }
  } else {
    newBase_Id = undefined;
  }

  // create systems records for aircraft and store ID in aircraft.system
  if (req.body.loadout && req.body.loadout.length != 0){
    // create systems records for aircraft and store ID in aircraft.system
    newAircraftSystems = [];
    for (let sys of req.body.loadout) {
      let sysRef = systems[systems.findIndex(system => system.code === sys )];
      if (sysRef) {
        if (validUnitType(sysRef.unitType, newType))  {
          newSystem = await new System(sysRef);
          newSystem.unitType = newType;
          await newSystem.save(((err, newSystem) => {
            if (err) {
              console.error(`New Aircraft System Save Error: ${err}`);
              res.status(400).send(`Aircraft System Save Error ${name} Error: ${err}`);  
            }
          }));
          newAircraftSystems.push(newSystem._id)
        } else {
          console.log('Error in creation of system - wrong UnitType ', sys, " for ", name );
        }  
      } else {
        console.log('Error in creation of system', sys, " for ", name );
      }
    }
  }

  let aircraft = await Aircraft.findOneAndUpdate({ _id: req.params.id }, 
    { name,
      zone: newZone_Id,
      country: newCountry_Id,
      team: newTeam_Id,
      baseOrig: newBase_Id,
      systems: newAircraftSystems,
      type: newType
    }, 
    { new: true,
      omitUndefined: true });

    updateStats(aircraft._id);
    aircraft = await Aircraft.findById(aircraft._id)
      .populate('team', 'shortName')
      .populate('systems', 'name category')
      .populate('zone', 'zoneName')
      .populate('country', 'name')
      .populate('site', 'name')
      .populate('baseOrig', 'name');

    res.status(200).json(aircraft);
    console.log(`Aircraft ${req.params.id} updated...`);
    console.log(`Aircraft named ${aircraft.name}...`);
});

// @route   DELETE api/aircraft/:id
// @Desc    Delete an aircraft
// @access  Public
router.delete('/:id', async function (req, res) {
  let id = req.params.id;
  const aircraft = await Aircraft.findByIdAndRemove(id);
  if (aircraft != null) {
    // remove associated systems records
    for (let j = 0; j < aircraft.systems.length; ++j ) {
      sysId = aircraft.systems[j];
      let systemDel = await System.findByIdAndRemove(sysId);
      if (systemDel = null) {
        console.log(`The Aircraft System with the ID ${sysId} was not found!`);
      }
    }      
    console.log(`${aircraft.name} with the id ${id} was deleted!`);
    res.status(200).send(`${aircraft.name} with the id ${id} was deleted!`);
  } else {
    res.status(400).send(`No aircraft with the id ${id} exists!`);
  }
});

// @route   PATCH api/aircraft/resethull
// @desc    Update all aircrafts to max health
// @access  Public
router.patch('/resethull', auth, async function (req, res) {
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

// @route   PATCH api/aircraft/return
// @desc    Update all aircrafts to return to base
// @access  Public
router.patch('/return', async function (req, res) {
    let count = 0;
    for await (const aircraft of Aircraft.find()) {  
      if (aircraft.site.toHexString() !== aircraft.baseOrig.toHexString() || aircraft.status.deployed) {
        aircraft.mission = "Docked"
        aircraft.status.ready = true;
        aircraft.status.deployed = false;
        aircraft.country = aircraft.baseOrig.country;
        aircraft.site = aircraft.baseOrig._id
        aircraft.zone = aircraft.baseOrig.zone
        await aircraft.save();
        count++
      }
    }
    res.status(200).send(`${count} aircrafts succesfully returned!`);
    nexusEvent.emit('updateAircrafts');
    
});

// @route   PATCH api/aircraft/restore
// @desc    Update all aircrafts to be deployed
// @access  Public
router.patch('/restore', async function (req, res) {
  let count = 0;
    for await (let aircraft of Aircraft.find().populate('baseOrig')) {    
      aircraft.country = aircraft.baseOrig.country;
      aircraft.site = aircraft.baseOrig._id
      aircraft.zone = aircraft.baseOrig.zone
      await aircraft.save();
      count++
    }
    res.send("Restore Base...");
    nexusEvent.emit('updateAircrafts');
});

module.exports = router;