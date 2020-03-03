const routeDebugger = require('debug')('app:routes - sites');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

const { logger } = require('../../middleware/winston');

// Interceptor Model - Using Mongoose Model
const { Site } = require('../../models/sites/site')
const { Spacecraft, validateSpacecraft } = require('../../models/sites/spacecraft');
//const { BaseSite, validateBase } = require('../../models/sites/baseSite');
const { Country } = require('../../models/country'); 
const { Zone } = require('../../models/zone'); 
const { Team } = require('../../models/team/team'); 

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
    .sort({team: 1});

  res.status(200).json(sites);
});

// @route   POST api/sites/spacecraft/
// @Desc    Post a new spacecraft
// @access  Public
router.post('/spacecraft/', async function (req, res) {
  let { name, siteCode, shipType, team, country, status, teamCode, countryCode, hidden } = req.body;

  // check if unique ... if not gen one that will be
  let genCode = await genSiteCode(siteCode);
  
  siteCode = genCode;

  const newSpacecraft = new Spacecraft(
    { name, siteCode, shipType, team, country, status }
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

async function genSiteCode(startCode) {
  
  // are we good?
  let chkDoc = await Spacecraft.find({ siteCode: startCode });
  if (!chkDoc.length) {
    return startCode;
  } 

  // get all sites once
  let sFind = await Site.find();

  //need to gen one
  let sCode =  startCode + "-SC-";
  
  // 100 tries to get one
  genLoop1:
  for (let i = 0; i < 100; ++i ) {
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