const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

// Country Model - Using Mongoose Model
const {Country, validateCountry} = require('../../models/country'); 
const {Zone} = require('../../models/zone'); 
const {Team} = require('../../models/team'); 


// @route   GET api/countrys
// @Desc    Get all ACTIVE countrys
// @access  Public
// Only Active
router.get('/', async (req, res) => {
  try {
    let countrys = await Country.find().sort('code: 1');
    res.json(countrys);
  } catch (err) {
    console.log('Error:', err.message);
    res.status(400).send(err.message);
  } 
});

// @route   GET api/countrys/id
// @Desc    Get countrys by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {

    let id = req.params.id;
    try {
        const country = await Country.findById(id);
        if (country != null) {
          res.json(country);
        } else {
          res.status(404).send(`The Country with the ID ${id} was not found!`);
        }
    } catch (err) {
        console.log('Error:', err.message);
        res.status(400).send(err.message);
    }
});

// @route   GET api/countrys/code
// @Desc    Get countrys by Country Code
// @access  Public
router.get('/code/:code', async (req, res) => {
  let code = req.params.code;
  try {
    let country = await Country.find({ code });
    if (country.length) {
      res.json(country);
    } else {
      res.status(404).send(`The Country with the code ${code} was not found!`);
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.status(400).send(`Error: ${err.message}`);
  }
});

// @route   POST api/countrys
// @Desc    Create New Country
// @access  Public
router.post('/', async (req, res) => {
  
  let { code, name, zoneCode, unrest } = req.body;
  const newCountry = new Country(
      { code, name, unrest }
  );
  let docs = await Country.find({ code })
  if (!docs.length) {
     
    if (zoneCode != ""){
      let zone = await Zone.findOne({ zoneCode: zoneCode });  
      if (!zone) {
        console.log("Country Post Zone Error, New Country:", req.body.name, " Zone: ", zoneCode);
      } else {
        newCountry.zone.zone_id  = zone._id;
        newCountry.zone.zoneName = zone.zoneName;
        newCountry.zone.zoneCode = zone.zoneCode;
      }
    }

    if (req.body.teamCode != ""){
      let team = await Team.findOne({ teamCode: req.body.teamCode });  
      if (!team) {
        console.log("Country Post Team Error, New Country:", req.body.name, " Team: ", req.body.teamCode);
      } else {
        newCountry.team.team_id  = team._id;
        newCountry.team.teamName = team.shortName;
        newCountry.team.teamCode = team.teamCode;
      }
    }

    let { error } = validateCountry(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let country = await newCountry.save();
    res.json(country);
    console.log(`New Country ${req.body.code} created...`);
  } else {                
      console.log(`Country Code already exists: ${code}`);
      res.status(400).send(`Country Code ${code} already exists!`);
  }
});

// @route   PUT api/country/id
// @Desc    Update Existing Country
// @access  Public  
router.put('/:id', validateObjectId, async (req, res) => {
  let id = req.params.id;
  const { zoneCode, teamCode } = req.body;
  let newZone_id;
  let newZoneName;
  let newZoneCode;
  let newTeam_id;
  let newTeamCode;
  let newTeamName;
  try {
    const oldCountry = await Country.findById({ _id: req.params.id });
    if (oldCountry != null ) {
      newZone_id  = oldCountry.zone.zone_id;
      newZoneCode = oldCountry.zone.zoneCode;
      newZoneName = oldCountry.zone.zoneName;
      newTeamCode = oldCountry.team.teamCode;
      newTeamName = oldCountry.team.teamName;
      newTeam_id  = oldCountry.team.team_id;
    };

    if (zoneCode != "") {
      let zone = await Zone.findOne({ zoneCode: zoneCode });  
      if (!zone) {
        console.log("Country Put Zone Error, Update Country:", req.body.name, " Zone: ", zoneCode);
      } else {
        newZone_id  = zone._id;
        newZoneCode = zone.zoneCode;
        newZoneName = zone.zoneName;
      }
    } else {
      newZoneCode = "";
      newZoneName = "UN-Assigned";
      newZone_id  = undefined;
    }
    if (teamCode != "") {
      let team = await Team.findOne({ teamCode: teamCode });  
      if (!team) {
        console.log("Country Put Team Error, Update Country:", req.body.name, " Team: ", teamCode);
      } else {
        newTeam_id  = team._id;
        newTeamCode = team.teamCode;
        newTeamName = team.shortName;
      }
    } else {
      newTeamCode = "";
      newTeamName = "UN-Assigned";
      newTeam_id  = undefined;
    }

    const country = await Country.findByIdAndUpdate({ _id: req.params.id },
      { name: req.body.name,
          code: req.body.code,
          unrest: req.body.unrest,
          zone: {
            zone_id: newZone_id,
            zoneName: newZoneName,
            zoneCode: newZoneCode
          },
          team: {
            team_id: newTeam_id,
            teamName: newTeamName,
            teamCode: newTeamCode
          }
         }, 
        { new: true , 
          omitUndefined: true}
    );
    

    if (country != null) {
      const { error } = country.validateCountry(req.body); 
      if (error) return res.status(400).send(error.details[0].message);
      res.json(country);
    } else {
      res.status(404).send(`The Country with the ID ${id} was not found!`);
    }
  } catch (err) {
    console.log(`Country Put Error: ${err.message}`);
    res.status(400).send(`Country Put Error: ${err.message}`);
  }
});

// @route   DELETE api/country/id
// @Desc    Update Existing Country
// @access  Public   
router.delete('/:id', validateObjectId, async (req, res) => {

  let id = req.params.id;
  try {
      const country = await Country.findByIdAndRemove(req.params.id);

      if (country != null) {
        res.json(country);
      } else {
        res.status(404).send(`The Country with the ID ${id} was not found!`);
      } 
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.status(400).send(`Error: ${err.message}`);
  }        
});

// @route   PATCH api/country/deleteAll
// @desc    Delete All Countrys
// @access  Public
router.patch('/deleteAll', async function (req, res) {
  try {
      for await (const country of Country.find()) {    
        let id = country.id;  
        try {
          let countryDel = await Country.findByIdAndRemove(id);
          if (countryDel = null) {
            res.status(404).send(`The Country with the ID ${id} was not found!`);
          }
        } catch (err) {
          console.log(`Error: ${err.message}`);
          res.status(400).send(`Error: ${err.message}`);
        }
      }        
      res.status(200).send("All Countrys succesfully deleted!");
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.status(400).send(`Error: ${err.message}`);
  };
});

module.exports = router;