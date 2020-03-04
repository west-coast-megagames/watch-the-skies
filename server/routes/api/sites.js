const routeDebugger = require('debug')('app:routes - sites');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

const { logger } = require('../../middleware/winston');

// Interceptor Model - Using Mongoose Model
const { Site, validateSite, BaseSite, validateBase, 
        CitySite, validateCity, CrashSite, validateCrash, Spacecraft, validateSpacecraft } = require('../../models/sites/site');
const { Country } = require('../../models/country'); 
const { Zone } = require('../../models/zone'); 
const { Team } = require('../../models/team/team'); 
const { convertToDms } = require('../../util/systems/geo');
const { System } = require('../../models/gov/equipment/systems');
const { loadSystems, systems, validUnitType } = require('../../wts/construction/systems/systems');

// @route   GET api/sites
// @Desc    Get all sites
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up all sites...');
    let sites = await Site.find()
      .populate('country', 'name')
      .populate('team', 'shortName name')
      .populate('facilities', 'name type')
      .populate('zone', 'model zoneName zoneCode')
      .sort({team: 1});

    res.status(200).json(sites);
});

// @route   GET api/sites/id
// @Desc    Get sites by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
  let id = req.params.id;
  const site = await Site.findById(id)
                         .populate('country', 'name')
                         .populate('team', 'shortName name')
                         .populate('facilities', 'name type')
                         .populate('zone', 'model zoneName zoneCode')
                         .sort({team: 1});
  if (site != null) {
    res.json(site);
  } else {
    res.status(404).send(`The Site with the ID ${id} was not found!`);
  }
});

// @route   GET api/sites/base
// @Desc    Get all baseSites 
// @access  Public
router.get('/base/', async function (req, res) {
  routeDebugger('Looking up all base sites...');
  let sites = await Site.find({type: "Base"})
    .populate('country', 'name')
    .populate('team', 'shortName name')
    .populate('facilities', 'name type')
    .populate('zone', 'model zoneName zoneCode')
    .sort({team: 1});

  res.status(200).json(sites);
});

// @route   GET api/sites/spacecraft/
// @Desc    Get all spacecraft Sites 
// @access  Public
router.get('/spacecraft/', async function (req, res) {
  routeDebugger('Looking up all spacecraft sites...');
  let sites = await Site.find({type: "Spacecraft"})
    .populate('country', 'name')
    .populate('team', 'shortName name')
    .populate('facilities', 'name type')
    .populate('zone', 'model zoneName zoneCode')
    .sort({team: 1});

  res.status(200).json(sites);
});

// @route   GET api/sites/city/
// @Desc    Get all city Sites 
// @access  Public
router.get('/city/', async function (req, res) {
  routeDebugger('Looking up all city sites...');
  let sites = await Site.find({type: "City"})
    .populate('country', 'name')
    .populate('team', 'shortName name')
    .populate('facilities', 'name type')
    .populate('zone', 'model zoneName zoneCode')
    .sort({team: 1});

  res.status(200).json(sites);
});

// @route   GET api/sites/crash/
// @Desc    Get all crash Sites 
// @access  Public
router.get('/crash/', async function (req, res) {
  routeDebugger('Looking up all crash sites...');
  let sites = await Site.find({type: "Crash"})
    .populate('country', 'name')
    .populate('team', 'shortName name')
    .populate('facilities', 'name type')
    .populate('zone', 'model zoneName zoneCode')
    .populate('salvage', 'category name')
    .sort({team: 1});

  res.status(200).json(sites);
});

// @route   POST api/sites/spacecraft/
// @Desc    Post a new spacecraft
// @access  Public
router.post('/spacecraft/', async function (req, res) {
  let { name, siteCode, shipType, team, country, status, teamCode, countryCode, hidden } = req.body;

  // check if unique ... if not gen one that will be
  let genCode = await genSiteCode(siteCode, "Spacecraft");
  
  siteCode = genCode;

  let newLatDMS = convertToDms(req.body.latDecimal, false);
  let newLongDMS = convertToDms(req.body.longDecimal, true); 
  const newSpacecraft = new Spacecraft(
    { name, siteCode, shipType, team, country, status,
      geoDMS: {latDMS: newLatDMS, longDMS: newLongDMS},
      geoDecimal: {latDecimal: req.body.latDecimal, longDecimal: req.body.longDecimal} 
    }
    );
  
  let docs = await Spacecraft.find({ siteCode })
  if (!docs.length) {

    if (teamCode != ""){
      let team = await Team.findOne({ teamCode });  
      if (!team) {
        routeDebugger("Spacecraft Post Team Error, New Spacecraft:", name, " Team: ", teamCode);
        logger.error(`Spacecraft Post Team Error, New Spacecraft: ${name} Team Code ${teamCode}`);
      } else {
        newSpacecraft.team  = team._id;
        routeDebugger("Spacecraft Post Team Found, Spacecraft:", name, " Team: ", teamCode, "Team ID:", team._id);
      }
    }      

    let { error } = validateSpacecraft(newSpacecraft); 
    if (error) {
      routeDebugger("New Spacecraft Validate Error", siteCode, error.message);
      logger.error(`New Spacecraft Validate Error ${siteCode} ${error.message}`);
      return res.status(404).send(`New Spacecraft Validate Error ${siteCode} ${error.message}`);
    }

    newSpacecraft.shipType     = shipType;
    newSpacecraft.status       = status;
    newSpacecraft.hidden       = hidden;
    
    if (countryCode != ""){
      let country = await Country.findOne({ code: countryCode });  
      if (!country) {
        routeDebugger("Spacecraft Post Country Error, New Spacecraft:", name, " Country: ", countryCode);
        logger.error(`New Spacecraft Country Code Error ${siteCode} ${countryCode}`);
      } else {
        newSpacecraft.country = country._id;
        newSpacecraft.zone    = country.zone;
        routeDebugger("Spacecraft Post Country Found, New Spacecraft:", name, " Country: ", countryCode, "Country ID:", country._id);
      }      
    } else {
      let country = await Country.findById({ country });  
      if (!country) {
        routeDebugger("Spacecraft Post Country Error, New Spacecraft:", name, " Country: ", country);
        logger.error(`New Spacecraft Country ID Error ${siteCode} ${country}`);
      } else {
        newSpacecraft.country = country._id;
        newSpacecraft.zone    = country.zone;
        routeDebugger("Spacecraft Post Country Found, New Spacecraft:", name, " Country: ", country.code, "Country ID:", country._id);
      }      
    }

    // create facility records for spacecraft 
    for (let i = 0; i < req.body.facilities.length; ++i ) {
      let fac = req.body.facilities[i];
      let facError = false;
      let facType  = fac.type;
      let facId    = null;
      //switch not working ... using if else
      if (facType == 'Factory') {
        newFacility = await new Factory(fac);
        facId = newFacility._id;
      } else if (facType == 'Lab') {
        newFacility = await new Lab(fac);
        facId = newFacility._id;
      } else if (facType == 'Hanger') {
        newFacility = await new Hanger(fac);
        facId = newFacility._id;
      } else {
        logger.error("Invalid Facility Type In spacecraft Post:", fac.type);
        facError = true;
      }
       
      if (!facError) {
        newFacility.site = newSpacecraft._id;
        newFacility.team = newSpacecraft.team;
  
        await newFacility.save(((err, newFacility) => {
          if (err) {
            logger.error(`New Spacecraft Facility Save Error: ${err}`);
            return res.status(404).send(`New Spacecraft Facility Save Error ${siteCode} ${err}`);
          }
          routeDebugger(newSpacecraft.name, "Facility", fac.name, " add saved to facility collection.");
        }));
      }
    }  

    await newSpacecraft.save((err, newSpacecraft) => {
      if (err) {
        logger.error(`New Spacecraft Save Error ${siteCode} ${err}`);
        return res.status(404).send(`New Spacecraft Save Error ${siteCode} ${err}`);
      }
      routeDebugger(newSpacecraft.name + " add saved to Spacecraft collection.");
      //updateStats(newSpacecraft._id);

      if (newSpacecraft.shipType === "Satellite") {
         addSatelliteToZone(newSpacecraft._id, newSpacecraft.zone, newSpacecraft.team);
      };
      
      res.status(200).json(newSpacecraft);

    });    
  } else {                
    logger.info(`Spacecraft already exists: ${siteCode}`);
    res.status(400).send(`Spacecraft ${siteCode} already exists!`);
  }    
});

async function addSatelliteToZone(satId, zoneId, teamId) {


  let useZoneId = zoneId;
  let team = await Team.findById( teamId );
  if (team) {
    routeDebugger(`About to find home country for team ${team.name}`);
    if (team.homeCountry) {
      routeDebugger(`Aboit to find home country for ${team.name} ${team.homeCountry}`);
      let country = await Country.findById( {"_id": team.homeCountry} );
      if (country) {
        if (country.zone) {
          useZoneId = country.zone;
          routeDebugger(`Found home country ${country.name} zone ${country.zone} for ${team.name}`);
        }
      }
    }
  }

  let zoneUpd = await Zone.findById( useZoneId );

  if (!zoneUpd) {
    routeDebugger(`Unable to add satellite with id ${satId} to zone with id ${useZoneId}`);
  } else {
    zoneUpd.satellite.push(satId);  
    await zoneUpd.save();
  }
}

// @route   POST api/sites/base/
// @Desc    Post a new base
// @access  Public
router.post('/base/', async function (req, res) {
  let { name, siteCode, team, country, teamCode, countryCode, hidden } = req.body;

  // check if unique ... if not gen one that will be
  let genCode = await genSiteCode(siteCode, "Base");
  
  siteCode = genCode;

  let newLatDMS = convertToDms(req.body.latDecimal, false);
  let newLongDMS = convertToDms(req.body.longDecimal, true); 
  const newBaseSite = new BaseSite(
    { name, siteCode, team, country,
      geoDMS: {latDMS: newLatDMS, longDMS: newLongDMS},
      geoDecimal: {latDecimal: req.body.latDecimal, longDecimal: req.body.longDecimal} 
    }
    );
  
  let docs = await BaseSite.find({ siteCode })
  if (!docs.length) {

    if (teamCode != ""){
      let team = await Team.findOne({ teamCode });  
      if (!team) {
        routeDebugger("Base Post Team Error, New Base:", name, " Team: ", teamCode);
        logger.error(`Base Post Team Error, New Base: ${name} Team Code ${teamCode}`);
      } else {
        newBaseSite.team  = team._id;
        routeDebugger("Base Post Team Found, Base:", name, " Team: ", teamCode, "Team ID:", team._id);
      }
    }      

    let { error } = validateBase(newBaseSite); 
    if (error) {
      routeDebugger("New Base Validate Error", siteCode, error.message);
      logger.error(`New Base Validate Error ${siteCode} ${error.message}`);
      return res.status(404).send(`New Base Validate Error ${siteCode} ${error.message}`);
    }

    newBaseSite.defenses     = req.body.defenses;
    newBaseSite.public       = req.body.public;
    newBaseSite.hidden       = hidden;
    
    if (countryCode != ""){
      let country = await Country.findOne({ code: countryCode });  
      if (!country) {
        routeDebugger("Base Post Country Error, New Base:", name, " Country: ", countryCode);
        logger.error(`New Base Country Code Error ${siteCode} ${countryCode}`);
      } else {
        newBaseSite.country = country._id;
        newBaseSite.zone    = country.zone;
        routeDebugger("Base Post Country Found, New Base:", name, " Country: ", countryCode, "Country ID:", country._id);
      }      
    } else {
      let country = await Country.findById({ country });  
      if (!country) {
        routeDebugger("Base Post Country Error, New Base:", name, " Country: ", country);
        logger.error(`New Base Country ID Error ${siteCode} ${country}`);
      } else {
        newBaseSite.country = country._id;
        newBaseSite.zone    = country.zone;
        routeDebugger("Base Post Country Found, New Base:", name, " Country: ", country.code, "Country ID:", country._id);
      }      
    }

    // create facility records for Base 
    for (let i = 0; i < req.body.facilities.length; ++i ) {
      let fac = req.body.facilities[i];
      let facError = false;
      let facType  = fac.type;
      let facId    = null;
      //switch not working ... using if else
      if (facType == 'Factory') {
        newFacility = await new Factory(fac);
        facId = newFacility._id;
      } else if (facType == 'Lab') {
        newFacility = await new Lab(fac);
        facId = newFacility._id;
      } else if (facType == 'Hanger') {
        newFacility = await new Hanger(fac);
        facId = newFacility._id;
      } else {
        logger.error("Invalid Facility Type In Base Post:", fac.type);
        facError = true;
      }
       
      if (!facError) {
        newFacility.site = newBaseSite._id;
        newFacility.team = newBaseSite.team;
  
        await newFacility.save(((err, newFacility) => {
          if (err) {
            logger.error(`New Base Facility Save Error: ${err}`);
            return res.status(404).send(`New Base Facility Save Error ${siteCode} ${err}`);
          }
          routeDebugger(newBaseSite.name, "Facility", fac.name, " add saved to facility collection.");
        }));
      }
    }  

    await newBaseSite.save((err, newBaseSite) => {
      if (err) {
        logger.error(`New Base Save Error ${siteCode} ${err}`);
        return res.status(404).send(`New Base Save Error ${siteCode} ${err}`);
      }
      routeDebugger(newBaseSite.name + " add saved to Base collection.");
      //updateStats(newBaseSite._id);

      res.status(200).json(newBaseSite);

    });    
  } else {                
    logger.info(`Base already exists: ${siteCode}`);
    res.status(400).send(`Base ${siteCode} already exists!`);
  }    
});


// @route   POST api/sites/city/
// @Desc    Post a new city
// @access  Public
router.post('/city/', async function (req, res) {
  let { name, siteCode, team, country, teamCode, countryCode, hidden, dateline } = req.body;

  // check if unique ... if not gen one that will be
  let genCode = await genSiteCode(siteCode, "City");
  
  siteCode = genCode;

  let newLatDMS = convertToDms(req.body.latDecimal, false);
  let newLongDMS = convertToDms(req.body.longDecimal, true); 
  const newCitySite = new CitySite(
    { name, siteCode, team, country, dateline,
      geoDMS: {latDMS: newLatDMS, longDMS: newLongDMS},
      geoDecimal: {latDecimal: req.body.latDecimal, longDecimal: req.body.longDecimal} 
    }
    );
  
  let docs = await CitySite.find({ siteCode })
  if (!docs.length) {

    if (teamCode != ""){
      let team = await Team.findOne({ teamCode });  
      if (!team) {
        routeDebugger("City Post Team Error, New City:", name, " Team: ", teamCode);
        logger.error(`City Post Team Error, New City: ${name} Team Code ${teamCode}`);
      } else {
        newCitySite.team  = team._id;
        routeDebugger("City Post Team Found, City:", name, " Team: ", teamCode, "Team ID:", team._id);
      }
    }      

    let { error } = validateCity(newCitySite); 
    if (error) {
      routeDebugger("New City Validate Error", siteCode, error.message);
      logger.error(`New City Validate Error ${siteCode} ${error.message}`);
      return res.status(404).send(`New City Validate Error ${siteCode} ${error.message}`);
    }

    newCitySite.defenses     = req.body.defenses;
    newCitySite.public       = req.body.public;
    newCitySite.hidden       = hidden;
    
    if (countryCode != ""){
      let country = await Country.findOne({ code: countryCode });  
      if (!country) {
        routeDebugger("City Post Country Error, New City:", name, " Country: ", countryCode);
        logger.error(`New City Country Code Error ${siteCode} ${countryCode}`);
      } else {
        newCitySite.country = country._id;
        newCitySite.zone    = country.zone;
        routeDebugger("City Post Country Found, New City:", name, " Country: ", countryCode, "Country ID:", country._id);
      }      
    } else {
      let country = await Country.findById({ country });  
      if (!country) {
        routeDebugger("City Post Country Error, New City:", name, " Country: ", country);
        logger.error(`New City Country ID Error ${siteCode} ${country}`);
      } else {
        newCitySite.country = country._id;
        newCitySite.zone    = country.zone;
        routeDebugger("City Post Country Found, New City:", name, " Country: ", country.code, "Country ID:", country._id);
      }      
    }

    // create facility records for City 
    for (let i = 0; i < req.body.facilities.length; ++i ) {
      let fac = req.body.facilities[i];
      let facError = false;
      let facType  = fac.type;
      let facId    = null;
      //switch not working ... using if else
      if (facType == 'Factory') {
        newFacility = await new Factory(fac);
        facId = newFacility._id;
      } else if (facType == 'Lab') {
        newFacility = await new Lab(fac);
        facId = newFacility._id;
      } else if (facType == 'Hanger') {
        newFacility = await new Hanger(fac);
        facId = newFacility._id;
      } else {
        logger.error("Invalid Facility Type In City Post:", fac.type);
        facError = true;
      }
       
      if (!facError) {
        newFacility.site = newCitySite._id;
        newFacility.team = newCitySite.team;
  
        await newFacility.save(((err, newFacility) => {
          if (err) {
            logger.error(`New City Facility Save Error: ${err}`);
            return res.status(404).send(`New City Facility Save Error ${siteCode} ${err}`);
          }
          routeDebugger(newCitySite.name, "Facility", fac.name, " add saved to facility collection.");
        }));
      }
    }  

    await newCitySite.save((err, newCitySite) => {
      if (err) {
        logger.error(`New City Save Error ${siteCode} ${err}`);
        return res.status(404).send(`New City Save Error ${siteCode} ${err}`);
      }
      routeDebugger(newCitySite.name + " add saved to City collection.");
      //updateStats(newCitySite._id);

      res.status(200).json(newCitySite);

    });    
  } else {                
    logger.info(`City already exists: ${siteCode}`);
    res.status(400).send(`City ${siteCode} already exists!`);
  }    
});


// @route   POST api/sites/crash/
// @Desc    Post a new crash
// @access  Public
router.post('/crash/', async function (req, res) {
  let { name, siteCode, team, country, teamCode, countryCode, hidden, status} = req.body;

  if (systems.length == 0) {
    await loadSystems();                         // load wts/json/equipment/systems.json data into array   
  }

  // check if unique ... if not gen one that will be
  let genCode = await genSiteCode(siteCode, "Crash");
  
  siteCode = genCode;

  let newLatDMS = convertToDms(req.body.latDecimal, false);
  let newLongDMS = convertToDms(req.body.longDecimal, true); 
  const newCrashSite = new CrashSite(
    { name, siteCode, team, country, status,
      geoDMS: {latDMS: newLatDMS, longDMS: newLongDMS},
      geoDecimal: {latDecimal: req.body.latDecimal, longDecimal: req.body.longDecimal} 
    }
    );
  
  let docs = await CrashSite.find({ siteCode })
  if (!docs.length) {

    if (teamCode != ""){
      let team = await Team.findOne({ teamCode });  
      if (!team) {
        routeDebugger("Crash Post Team Error, New Crash Site:", name, " Team: ", teamCode);
        logger.error(`Crash Post Team Error, New Crash Site: ${name} Team Code ${teamCode}`);
      } else {
        newCrashSite.team  = team._id;
        routeDebugger("Crash Post Team Found, City:", name, " Team: ", teamCode, "Team ID:", team._id);
      }
    }      

    let { error } = validateCity(newCrashSite); 
    if (error) {
      routeDebugger("New Crash Site Validate Error", siteCode, error.message);
      logger.error(`New Crash Site Validate Error ${siteCode} ${error.message}`);
      return res.status(404).send(`New Crash Site Validate Error ${siteCode} ${error.message}`);
    }

    newCrashSite.hidden       = hidden;
    
    if (countryCode != ""){
      let country = await Country.findOne({ code: countryCode });  
      if (!country) {
        routeDebugger("Crash Post Country Error, New Crash Site:", name, " Country: ", countryCode);
        logger.error(`New Crash Site Country Code Error ${siteCode} ${countryCode}`);
      } else {
        newCrashSite.country = country._id;
        newCrashSite.zone    = country.zone;
        routeDebugger("Crash Post Country Found, New Crash Site:", name, " Country: ", countryCode, "Country ID:", country._id);
      }      
    } else {
      let country = await Country.findById({ country });  
      if (!country) {
        routeDebugger("Crash Post Country Error, New Crash Site:", name, " Country: ", country);
        logger.error(`New Crash Site Country ID Error ${siteCode} ${country}`);
      } else {
        newCrashSite.country = country._id;
        newCrashSite.zone    = country.zone;
        routeDebugger("Crash Post Country Found, New Crash Site:", name, " Country: ", country.code, "Country ID:", country._id);
      }      
    }

    // create facility records for Crash Site
    for (let i = 0; i < req.body.facilities.length; ++i ) {
      let fac = req.body.facilities[i];
      let facError = false;
      let facType  = fac.type;
      let facId    = null;
      //switch not working ... using if else
      if (facType == 'Factory') {
        newFacility = await new Factory(fac);
        facId = newFacility._id;
      } else if (facType == 'Lab') {
        newFacility = await new Lab(fac);
        facId = newFacility._id;
      } else if (facType == 'Hanger') {
        newFacility = await new Hanger(fac);
        facId = newFacility._id;
      } else {
        logger.error("Invalid Facility Type In Crash Post:", fac.type);
        facError = true;
      }
       
      if (!facError) {
        newFacility.site = newCrashSite._id;
        newFacility.team = newCrashSite.team;
  
        await newFacility.save(((err, newFacility) => {
          if (err) {
            logger.error(`New Crash Site Facility Save Error: ${err}`);
            return res.status(404).send(`New Crash Site Facility Save Error ${siteCode} ${err}`);
          }
          routeDebugger(newCrashSite.name, "Facility", fac.name, " add saved to facility collection.");
        }));
      }
    }  

    newCrashSite.salvage = [];
    for (let sys of req.body.salvage) {
      let sysRef = systems[systems.findIndex(system => system.code === sys )];
      //console.log("jeff in crash site systems ", sys, "sysRef:", sysRef);
      if (sysRef) {
        //don't care about unitType here
        newSystem = await new System(sysRef);
        newSystem.team         = newCrashSite.team;
        newSystem.manufacturer = newCrashSite.team;  
        newSystem.status.building = false;
        newSystem.unitType = "CrashSite";
        //console.log("jeff in newCrashSite before systems save ... sysRef:", sysRef);            
        await newSystem.save(((err, newSystem) => {
          if (err) {
            logger.error(`New Crash Site System Save Error: ${err}`);
            return console.error(`New Crash Site System Save Error: ${err}`);
          }
          logger.debug(`newCrashSite.name, system ${sys} add saved to system collection.`);
        }));

        newCrashSite.salvage.push(newSystem._id)
        /*
        } else {
              logger.debug(`Error in creation of system ${sys} for  ${newCrashSite.name} - wrong unitType`);
            }
        */
      } else {
        logger.debug(`Error in creation of system ${sys} for  ${newCrashSite.name}`);
      }
    }

    await newCrashSite.save((err, newCrashSite) => {
      if (err) {
        logger.error(`New Crash Site Save Error ${siteCode} ${err}`);
        return res.status(404).send(`New Crash Site Save Error ${siteCode} ${err}`);
      }
      routeDebugger(newCrashSite.name + " add saved to City collection.");
      //updateStats(newCrashSite._id);

      res.status(200).json(newCrashSite);

    });    
  } else {                
    logger.info(`Crash Site already exists: ${siteCode}`);
    res.status(400).send(`City ${siteCode} already exists!`);
  }    
});


async function genSiteCode(startCode, siteType) {
  
  if (!startCode) {
    startCode = siteType;
  }
  // are we good?
  let chkDoc = await Site.find({ siteCode: startCode });
  if (!chkDoc.length) {
    return startCode;
  } 

  // get all sites once
  let sFind = await Site.find();

  //need to gen one
  let sCode =  startCode + "-" + siteType;
  
  // 300 tries to get one
  genLoop1:
  for (let i = 0; i < 300; ++i ) {
    testCode = sCode + i.toString();
    oneFound = false;
    genLoop2:
    for (let j = 0; j < sFind.length; ++j ) {
      if (sFind[j].siteCode === testCode) {
        oneFound = true;
        break genLoop2;
      } 
    }
    if (!oneFound) {
      break genLoop1;
    }
  }

  return testCode;
}

module.exports = router;