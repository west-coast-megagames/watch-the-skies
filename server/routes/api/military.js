const express = require("express");
const router = express.Router();
const nexusEvent = require("../../startup/events");

const auth = require("../../middleware/auth");
const validateObjectId = require("../../middleware/validateObjectId");

// Military Model - Using Mongoose Model
const { Military, updateStats, validateMilitary } = require("../../models/ops/military/military");
const { Country } = require("../../models/country");
const { Zone } = require("../../models/zone");
const { Team } = require("../../models/team/team");
const { Site } = require("../../models/sites/site");
const { Gear } = require("../../models/gov/equipment/equipment");

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
