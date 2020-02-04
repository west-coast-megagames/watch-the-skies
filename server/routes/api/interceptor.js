const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');

const auth = require('../../middleware/auth');
const validateObjectId = require('../../middleware/validateObjectId');

// Interceptor Model - Using Mongoose Model
const { Interceptor, validateInterceptor } = require('../../models/ops/interceptor');
const { Aircraft } = require('../../models/ops/aircraft');
const { Country } = require('../../models/country'); 
const { Zone } = require('../../models/zone'); 
const { Team } = require('../../models/team'); 
const { Base } = require('../../models/base'); 
const { BaseSite } = require('../../models/sites/baseSite');

// @route   GET api/interceptor
// @Desc    Get all Interceptors
// @access  Public
router.get('/', async function (req, res) {
    //console.log('Sending interceptors somewhere...');
    let interceptors = await Interceptor.find()
      .sort({team: 1})
      .populate('team', 'name shortName')
      .populate('location.zone', 'zoneName')
      .populate('location.country', 'name')
      .populate('systems', 'name category')
      .populate('base', 'baseName')
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
      .populate('location.zone', 'zoneName')
      .populate('location.country', 'name')
      .populate('systems', 'name category')
      .populate('base', 'baseName')
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
    let { name, team, location, stats } = req.body;
    const newInterceptor = new Interceptor(
        { name, team, location, stats }
    );
    let docs = await Interceptor.find({ name })
    if (!docs.length) {

        if (req.body.zoneCode != ""){
          let zone = await Zone.findOne({ zoneCode: req.body.zoneCode });  
          if (!zone) {
            console.log("Interceptor Post Zone Error, New Interceptor:", req.body.name, " Zone: ", req.body.zoneCode);
          } else {
              newInterceptor.location.zone = zone._id;
          }
        }

        if (req.body.teamCode != ""){
            let team = await Team.findOne({ teamCode: req.body.teamCode });  
            if (!team) {
                console.log("Interceptor Post Team Error, New Interceptor:", req.body.name, " Team: ", req.body.teamCode);
            } else {
              newInterceptor.team = team._id;
            }
        }
      
        if (req.body.countryCode != ""){
          let country = await Country.findOne({ code: req.body.countryCode });  
          if (!country) {
              console.log("Interceptor Post Country Error, New Interceptor:", req.body.name, " Country: ", req.body.countryCode);
          } else {
            newInterceptor.location.country = country._id;
          }
        }

        let interceptor = await newInterceptor.save();
        res.json(interceptor);
        console.log(`Interceptor ${req.body.name} created...`);
    } else {                
        console.log(`Interceptor already exists: ${name}`);
        res.send(`Interceptor ${name} already exists!`);
    }
});

// @route   PUT api/interceptor/:id
// @Desc    Update an interceptor
// @access  Public
router.put('/:id', async function (req, res) {
    let { name, zoneCode, teamCode, countryCode } = req.body;
    let newZone_id;
    let newTeam_id;
    let newCountry_id;

    const oldInterceptor = await Interceptor.findById({ _id: req.params.id });
    if (oldInterceptor != null ) {
      newZone_id    = oldInterceptor.location.zone;
      newTeam_id    = oldInterceptor.team;
      newCountry_id = oldInterceptor.location.country;
    };

    if (zoneCode != "") {
      let zone = await Zone.findOne({ zoneCode: zoneCode });  
      if (!zone) {
        console.log("Interceptor Put Zone Error, Update Interceptor:", req.body.name, " Zone: ", zoneCode);
      } else {
        newZone_id  = zone._id;
      }
    } else {
      newZone_id  = undefined;
    }
    
    if (teamCode != "") {
      let team = await Team.findOne({ teamCode: teamCode });  
      if (!team) {
        console.log("Interceptor Put Team Error, Update Interceptor:", req.body.name, " Team: ", teamCode);
      } else {
        newTeam_id  = team._id;
      }
    } else {
      newTeam_id  = undefined;
    }

    if (countryCode != "") {
      let country = await Country.findOne({ code: countryCode });  
      if (!country) {
        console.log("Interceptor Put Country Error, Update Interceptor:", req.body.name, " Country: ", countryCode);
      } else {
        newCountry_id  = country._id;
      }
    } else {
      newCountry_id  = undefined;
    }

    const interceptor = await Interceptor.findOneAndUpdate({ _id: req.params.id }, 
        { name,
          location: {
            zone: newZone_id,
            country: newCountry_id
          },
          team: newTeam_id
        }, 
        { new: true,
          omitUndefined: true });
    res.json(interceptor);
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
        console.log(`${interceptor.name} with the id ${id} was deleted!`);
        res.send(`${interceptor.name} with the id ${id} was deleted!`);
    } else {
        res.send(`No interceptor with the id ${id} exists!`);
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