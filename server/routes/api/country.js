const express = require("express");
const router = express.Router();
const validateObjectId = require("../../middleware/validateObjectId");

// Country Model - Using Mongoose Model
const { Country, validateCountry } = require("../../models/country");
const { Zone } = require("../../models/zone");
const { Team } = require("../../models/team/team");

const { logger } = require("../../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

// @route   GET api/country
// @Desc    Get all ACTIVE countries
// @access  Public
// Only Active
router.get("/", async (req, res) => {
  try {
    let countrys = await Country.find()
      .sort("code: 1")
      .populate("team", "name shortName")
      .populate("zone", "name")
      .populate("borderedBy", "name");
    res.json(countrys);
  } catch (err) {
    logger.error(`Get Country Catch Error ${err.message}`, { meta: err });
    res.status(400).send(err.message);
  }
});

// @route   GET api/country
// @Desc    Get all ACTIVE countries
// @access  Public
// Only Active
router.get("/byZones", async (req, res) => {
  try {
    let countrys = await Country.find()
      .populate("zone", "code name terror -_id")
      .select("code name -_id");

    //countrys.sort((a , b) => (a.code < b.code) ? -1 :
    //                         (a.code > b.code ? 1 : 0) );

    var sortByProperty = function (property) {
      return function (x, y) {
        return x[property] === y[property]
          ? 0
          : x[property] > y[property]
          ? 1
          : -1;
      };
    };

    countrys.sort(sortByProperty("zone", "code"));
    //.sort(sortByProperty('code'));

    res.json(countrys);
  } catch (err) {
    logger.error(`Get Country byZones Catch Error ${err.message}`, {
      meta: err,
    });
    res.status(400).send(err.message);
  }
});

// @route   GET api/country/id
// @Desc    Get countries by id
// @access  Public
router.get("/id/:id", validateObjectId, async (req, res) => {
  let id = req.params.id;
  try {
    const country = await Country.findById(id)
      .populate("team", "name shortName")
      .populate("zone", "name")
      .populate("borderedBy", "name");
    if (country != null) {
      res.json(country);
    } else {
      res.status(404).send(`The Country with the ID ${id} was not found!`);
    }
  } catch (err) {
    logger.error(`Get Country by ID Catch Error ${err.message}`, { meta: err });
    res.status(400).send(err.message);
  }
});

// @route   GET api/country/code
// @Desc    Get countries by Country Code
// @access  Public
router.get("/code/:code", async (req, res) => {
  let code = req.params.code;
  try {
    let country = await Country.find({ code })
      .populate("team", "name shortName")
      .populate("zone", "name")
      .populate("borderedBy", "name");
    if (country.length) {
      res.json(country);
    } else {
      res.status(404).send(`The Country with the code ${code} was not found!`);
    }
  } catch (err) {
    logger.error(`Get Country by Code Catch Error ${err.message}`, {
      meta: err,
    });
    res.status(400).send(`Error: ${err.message}`);
  }
});

// @route   POST api/country
// @Desc    Create New Country
// @access  Public
router.post("/", async (req, res) => {
  let { code, name, zoneCode, unrest } = req.body;
  const newCountry = new Country({
    code,
    name,
    unrest,
    loadZoneCode: zoneCode,
    loadTeamCode: req.body.teamCode,
  });
  let docs = await Country.find({ code });
  if (!docs.length) {
    if (code != "") {
      let zone = await Zone.findOne({ code: zoneCode });
      if (!zone) {
        console.log(
          "Country Post Zone Error, New Country:",
          req.body.name,
          " Zone: ",
          zoneCode
        );
      } else {
        newCountry.zone = zone._id;
      }
    }

    if (req.body.teamCode != "") {
      let team = await Team.findOne({ teamCode: req.body.teamCode });
      if (!team) {
        console.log(
          "Country Post Team Error, New Country:",
          req.body.name,
          " Team: ",
          req.body.teamCode
        );
      } else {
        newCountry.team = team._id;
      }
    }

    let { error } = validateCountry(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let country = await newCountry.save();
    res.json(country);
    logger.info(`New Country ${req.body.code} created...`);
  } else {
    logger.error(`Country Code already exists: ${code}`);
    res.status(400).send(`Country Code ${code} already exists!`);
  }
});

// @route   PUT api/country/id
// @Desc    Update Existing Country
// @access  Public
router.put("/:id", validateObjectId, async (req, res) => {
  let id = req.params.id;
  const { zoneCode, teamCode } = req.body;
  let newZone_id;
  let newTeam_id;
  try {
    const oldCountry = await Country.findById({ _id: req.params.id });
    if (oldCountry != null) {
      newZone_id = oldCountry.zone;
      newTeam_id = oldCountry.team;
    }

    if (zoneCode != "") {
      let zone = await Zone.findOne({ code: zoneCode });
      if (!zone) {
        logger.error(
          "Country Put Zone Error, Update Country:",
          req.body.name,
          " Zone: ",
          zoneCode
        );
      } else {
        newZone_id = zone._id;
      }
    } else {
      newZone_id = undefined;
    }
    if (teamCode != "") {
      let team = await Team.findOne({ teamCode: teamCode });
      if (!team) {
        logger.error(
          "Country Put Team Error, Update Country:",
          req.body.name,
          " Team: ",
          teamCode
        );
      } else {
        newTeam_id = team._id;
      }
    } else {
      newTeam_id = undefined;
    }

    const country = await Country.findByIdAndUpdate(
      { _id: req.params.id },
      {
        name: req.body.name,
        code: req.body.code,
        unrest: req.body.unrest,
        zone: newZone_id,
        team: newTeam_id,
      },
      { new: true, omitUndefined: true }
    );

    if (country != null) {
      const { error } = country.validateCountry(req.body);
      if (error) {
        logger.error(`Country Update Validate Error ${err.message}`, {
          meta: err,
        });
        return res.status(400).send(error.details[0].message);
      }
      res.json(country);
    } else {
      res.status(404).send(`The Country with the ID ${id} was not found!`);
    }
  } catch (err) {
    logger.error(`Country Put Catch Error ${err.message}`, { meta: err });
    res.status(400).send(`Country Put Error: ${err.message}`);
  }
});

// @route   DELETE api/country/id
// @Desc    Update Existing Country
// @access  Public
router.delete("/:id", validateObjectId, async (req, res) => {
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
router.patch("/deleteAll", async function (req, res) {
  try {
    await Country.deleteMany();
    /*
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
    */
    res.status(200).send("All Countrys succesfully deleted!");
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.status(400).send(`Error: ${err.message}`);
  }
});

module.exports = router;
