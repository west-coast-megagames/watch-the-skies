const express = require("express");
const router = express.Router();
const nexusEvent = require("../../startup/events");

const auth = require("../../middleware/auth");
const validateObjectId = require("../../middleware/validateObjectId");

// Military Model - Using Mongoose Model
const {
  Military,
  updateStats,
  validateMilitary,
} = require("../../models/ops/military/military");
const { Country } = require("../../models/country");
const { Zone } = require("../../models/zone");
const { Team } = require("../../models/team/team");
const { Site } = require("../../models/sites/site");
const { Gear } = require("../../models/gov/equipment/equipment");
const {
  loadGears,
  gears,
} = require("../../wts/construction/equipment/milGear");

// @route   GET api/military
// @Desc    Get all Militarys
// @access  Public
router.get("/", async function (req, res) {
  //console.log('Sending militarys somewhere...');
  let militarys = await Military.find()
    .sort({ team: 1 })
    .populate("team", "name shortName")
    .populate("zone", "name")
    .populate("country", "name")
    .populate("gear", "name category")
    .populate("site", "name")
    .populate("origin");
  res.json(militarys);
});

// @route   GET api/military
// @Desc    Get Militarys by ID
// @access  Public
router.get("/id/:id", validateObjectId, async (req, res) => {
  let id = req.params.id;
  let military = await Military.findById(id)
    .sort({ team: 1 })
    .populate("team", "name shortName")
    .populate("zone", "name")
    .populate("country", "name")
    .populate("gear", "name category")
    .populate("site", "name")
    .populate("origin", "name");
  if (military != null) {
    res.json(military);
  } else {
    res.status(404).send(`The Military with the ID ${id} was not found!`);
  }
});

// @route   POST api/military
// @Desc    Post a new military
// @access  Public
router.post("/", async function (req, res) {
  if (gear.length == 0) {
    await loadGears(); // load wts/json/equipment/gear.json data into array
  }
  let {
    name,
    team,
    country,
    zone,
    siteCode,
    stats,
    zoneCode,
    teamCode,
    countryCode,
    origin,
  } = req.body;
  const newMilitary = new Military({ name, team, country, zone, site, stats });
  let docs = await Military.find({ name });
  if (!docs.length) {
    if (zoneCode && zoneCode != "") {
      let zone = await Zone.findOne({ code: zoneCode });
      if (!zone) {
        console.log(
          "Military Post Zone Error, New Military:",
          req.body.name,
          " Zone: ",
          req.body.zoneCode
        );
      } else {
        newMilitary.zone = zone._id;
      }
    }

    if (teamCode && teamCode != "") {
      let team = await Team.findOne({ teamCode: teamCode });
      if (!team) {
        console.log(
          "Military Post Team Error, New Military:",
          req.body.name,
          " Team: ",
          req.body.teamCode
        );
      } else {
        newMilitary.team = team._id;
      }
    }

    if (countryCode && countryCode != "") {
      let country = await Country.findOne({ code: countryCode });
      if (!country) {
        console.log(
          "Military Post Country Error, New Military:",
          req.body.name,
          " Country: ",
          req.body.countryCode
        );
      } else {
        newMilitary.country = country._id;
        newMilitary.zone = country.zone;
      }
    }

    if (origin && origin != "") {
      let site = await Site.findOne({ siteCode: origin });
      if (!site) {
        console.log(
          "Military Post Home Base Error, New Military:",
          req.body.name,
          " Home Base: ",
          req.body.origin
        );
      } else {
        newMilitary.origin = site._id;
      }
    }

    if (siteCode && siteCode != "" && siteCode != "undefined") {
      let site = await Site.findOne({ siteCode: siteCode });
      if (!site) {
        console.log(
          "Military Post Site Error, New Military:",
          req.body.name,
          " Site: ",
          siteCode
        );
      } else {
        newMilitary.site = site._id;
        militaryLoadDebugger(
          "Military Post Site Found, Military:",
          req.body.name,
          " Site: ",
          siteCode,
          "Site ID:",
          site._id
        );
      }
    }

    // create gear records for military and store ID in military.gear
    if (req.body.gear && req.body.gear.length != 0) {
      // create gear records for military and store ID in military.gear
      newMilitary.gear = [];
      for (let ger of req.body.gear) {
        let gerRef = gears[gears.findIndex((gear) => gear.code === ger)];
        if (gerRef) {
          newGear = await new Gear(gerRef);
          await newGear.save((err, newGear) => {
            if (err) {
              console.error(`New Military Gear Save Error: ${err}`);
              res
                .status(400)
                .send(`Military Gear Save Error ${name} Error: ${err}`);
            }
          });
          newMilitary.gear.push(newGear._id);
        } else {
          console.log("Error in creation of gear", ger, " for ", name);
        }
      }
    }

    let { error } = validateMilitary(newMilitary);
    if (error) {
      console.log(
        "New Military Validate Error",
        newMilitary.name,
        error.message
      );
      // remove associated gear records
      for (let j = 0; j < newMilitary.gear.length; ++j) {
        gerId = newMilitary.gear[j];
        let gearDel = await Gear.findByIdAndRemove(gerId);
        if ((gearDel = null)) {
          console.log(`The Military Gear with the ID ${gerId} was not found!`);
        }
      }
      res
        .status(400)
        .send(`Military Validate Error ${name} Error: ${error.message}`);
    }

    let military = await newMilitary.save();

    military = await Military.findById(military._id)
      .populate("team", "name shortName")
      .populate("zone", "name")
      .populate("country", "name")
      .populate("gear", "name category")
      .populate("site", "name")
      .populate("origin", "name");

    updateStats(military._id);
    res.status(200).json(military);
    console.log(`Military ${req.body.name} created...`);
  } else {
    console.log(`Military already exists: ${name}`);
    res.status(400).send(`Military ${name} already exists!`);
  }
});

// @route   PUT api/military/:id
// @Desc    Update an military
// @access  Public
router.put("/:id", async function (req, res) {
  let { error } = validateMilitary(req.body);
  if (error) {
    console.log("Update Military Validate Error", req.body.name, error.message);
    res
      .status(400)
      .send(`Military Validate Error ${name} Error: ${error.message}`);
  }
  if (gear.length == 0) {
    await loadGears(); // load wts/json/gear.json data into array
  }
  let { name, zoneCode, teamCode, countryCode, origin } = req.body;
  let newZone_Id;
  let newTeam_Id;
  let newCountry_Id;
  let newMilitaryGear;
  let newSite_Id;
  let newOrigin_Id;

  const oldMilitary = await Military.findById({ _id: req.params.id });
  if (oldMilitary != null) {
    newZone_Id = oldMilitary.zone;
    newTeam_Id = oldMilitary.team;
    newCountry_Id = oldMilitary.country;
    newMilitaryGear = oldMilitary.gear;
    newSite_Id = oldMilitary.site;
    newOrigin_Id = oldMilitary.origin;
  }

  if (zoneCode && zoneCode != "") {
    let zone = await Zone.findOne({ code: zoneCode });
    if (!zone) {
      console.log(
        "Military Put Zone Error, Update Military:",
        req.body.name,
        " Zone: ",
        zoneCode
      );
    } else {
      newZone_Id = zone._id;
    }
  } else {
    newZone_Id = undefined;
  }

  if (teamCode && teamCode != "") {
    let team = await Team.findOne({ teamCode: teamCode });
    if (!team) {
      console.log(
        "Military Put Team Error, Update Military:",
        req.body.name,
        " Team: ",
        teamCode
      );
    } else {
      newTeam_Id = team._id;
    }
  } else {
    newTeam_Id = undefined;
  }

  if (countryCode && countryCode != "") {
    let country = await Country.findOne({ code: countryCode });
    if (!country) {
      console.log(
        "Military Put Country Error, Update Military:",
        req.body.name,
        " Country: ",
        countryCode
      );
    } else {
      newCountry_Id = country._id;
      newZone_Id = country.zone;
    }
  } else {
    newCountry_Id = undefined;
  }

  if (origin && origin != "") {
    let site = await Site.findOne({ siteCode: origin });
    if (!site) {
      console.log(
        "Military Put Home Base Error, Update Military:",
        req.body.name,
        " Home Base: ",
        origin
      );
    } else {
      newOrigin_Id = site._id;
    }
  } else {
    newOrigin_Id = undefined;
  }

  if (siteCode && siteCode != "" && siteCode != "undefined") {
    let site = await Site.findOne({ siteCode: siteCode });
    if (!site) {
      console.log(
        "Military Put Site Error, Update Military:",
        req.body.name,
        " Site: ",
        siteCode
      );
    } else {
      newSite_Id = site._id;
    }
  } else {
    newSite_Id = undefined;
  }

  // create gear records for military and store ID in military.gear
  if (req.body.gear && req.body.gear.length != 0) {
    // create gear records for military and store ID in military.gear
    newMilitaryGear = [];
    for (let ger of req.body.gear) {
      let gerRef = gears[gears.findIndex((gear) => gear.code === ger)];
      if (gerRef) {
        newGear = await new Gear(gerRef);
        await newGear.save((err, newGear) => {
          if (err) {
            console.error(`New Military Gear Save Error: ${err}`);
            res
              .status(400)
              .send(`Military Gear Save Error ${name} Error: ${err}`);
          }
        });
        newMilitaryGear.push(newGear._id);
      } else {
        console.log("Error in creation of gear", ger, " for ", name);
      }
    }
  }

  let military = await Military.findOneAndUpdate(
    { _id: req.params.id },
    {
      name,
      zone: newZone_Id,
      country: newCountry_Id,
      team: newTeam_Id,
      site: newSite_Id,
      gear: newMilitaryGear,
      origin: newOrigin_Id,
    },
    { new: true, omitUndefined: true }
  );

  updateStats(military._id);
  military = await Military.findById(military._id)
    .populate("team", "shortName")
    .populate("gear", "name category")
    .populate("zone", "name")
    .populate("country", "name")
    .populate("site", "name")
    .populate("origin");

  res.status(200).json(military);
  console.log(`Military ${req.params.id} updated...`);
  console.log(`Military named ${military.name}...`);
});

// @route   DELETE api/military/:id
// @Desc    Delete an military
// @access  Public
router.delete("/:id", async function (req, res) {
  let id = req.params.id;
  const military = await Military.findByIdAndRemove(id);
  if (military != null) {
    // remove associated gear records
    for (let j = 0; j < military.gear.length; ++j) {
      gerId = military.gear[j];
      let gearDel = await Gear.findByIdAndRemove(gerId);
      if ((gearDel = null)) {
        console.log(`The Military Gear with the ID ${gerId} was not found!`);
      }
    }
    console.log(`${military.name} with the id ${id} was deleted!`);
    res.status(200).send(`${military.name} with the id ${id} was deleted!`);
  } else {
    res.status(400).send(`No military with the id ${id} exists!`);
  }
});

module.exports = router;
