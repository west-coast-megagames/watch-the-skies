const express = require("express");
const router = express.Router();
const nexusEvent = require("../../startup/events");
const routeDebugger = require("debug")("app:routes:interceptor");
const auth = require("../../middleware/auth");
const validateObjectId = require("../../middleware/validateObjectId");

// Aircraft Model - Using Mongoose Model
const { Aircraft, validateAircraft } = require("../../models/ops/aircraft");
const { Country } = require("../../models/country");
const { Zone } = require("../../models/zone");
const { Team } = require("../../models/team/team");
const { BaseSite } = require("../../models/sites/site");
const { System } = require("../../models/gov/upgrade/upgrade");
const {
  validUnitType,
} = require("../../wts/util/construction/validateUnitType");
const { newUnit } = require("../../wts/construction/construction");

// @route   GET api/aircraft
// @Desc    Get all Aircrafts
// @access  Public
router.get("/", async function (req, res) {
  //console.log('Sending aircrafts somewhere...');
  let aircrafts = await Aircraft.find()
    .sort({ team: 1 })
    .populate("team", "name shortName")
    .populate("zone", "name")
    .populate("country", "name")
    .populate("systems", "name category")
    .populate("site", "name")
    .populate("origin", "name");
  res.json(aircrafts);
});

// @route   PUT api/aircraft/repair
// @desc    Update aircraft to max health
// @access  Public
router.put("/repair", async function (req, res) {
  let aircraft = await Aircraft.findById(req.body._id);
  console.log(req.body);
  let account = await Account.findOne({
    name: "Operations",
    team: aircraft.team,
  });
  if (account.balance < 2) {
    res
      .status(402)
      .send(
        `No Funding! Assign more money to your operations account to repair ${aircraft.name}.`
      );
  } else {
    account = await banking.withdrawal(
      account,
      2,
      `Repairs for ${aircraft.name}`
    );
    await account.save();
    modelDebugger(account);

    aircraft.status.repair = true;
    aircraft.ready = false;
    await aircraft.save();

    res.status(200).send(`${Aircraft.name} put in for repairs...`);
    nexusEvent.emit("updateAircrafts");
  }
});

// @route   GET api/aircraft
// @Desc    Get Aircrafts by ID
// @access  Public
router.get("/id/:id", validateObjectId, async (req, res) => {
  let id = req.params.id;
  let aircraft = await Aircraft.findById(id)
    .sort({ team: 1 })
    .populate("team", "name shortName")
    .populate("zone", "name")
    .populate("country", "name")
    .populate("systems", "name category")
    .populate("site", "name")
    .populate("base", "name");
  if (aircraft != null) {
    res.json(aircraft);
  } else {
    res.status(404).send(`The Aircraft with the ID ${id} was not found!`);
  }
});

// @route   DELETE api/aircraft/:id
// @Desc    Delete an aircraft
// @access  Public
router.delete("/:id", async function (req, res) {
  let id = req.params.id;
  const aircraft = await Aircraft.findByIdAndRemove(id);
  if (aircraft != null) {
    // remove associated systems records
    for (let j = 0; j < aircraft.systems.length; ++j) {
      sysId = aircraft.systems[j];
      let systemDel = await System.findByIdAndRemove(sysId);
      if ((systemDel = null)) {
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
router.patch("/resethull", auth, async function (req, res) {
  for await (const aircraft of Aircraft.find()) {
    console.log(`${aircraft.name} has ${aircraft.stats.hull} hull points`);
    aircraft.stats.hull = aircraft.stats.hullMax;
    aircraft.status.destroyed = false;
    console.log(`${aircraft.name} now has ${aircraft.stats.hull} hull points`);
    await aircraft.save();
  }
  res.send("Aircrafts succesfully reset!");
  nexusEvent.emit("updateAircrafts");
});

// @route   PATCH api/aircraft/restore
// @desc    Update all aircrafts to be deployed
// @access  Public
router.patch("/restore", async function (req, res) {
  let count = 0;
  for await (let aircraft of Aircraft.find().populate("origin")) {
    aircraft.country = aircraft.origin.country;
    aircraft.site = aircraft.origin._id;
    aircraft.zone = aircraft.origin.zone;
    await aircraft.save();
    count++;
  }
  res.send("Restore Base...");
  nexusEvent.emit("updateAircrafts");
});

// @route   POST api/aircraft/build
// @Desc    Takes in blueprint and name and facility(?) and starts construction on a new aircraft
// @access  Public
router.post("/build", async (req, res) => {
  let { name, facility, type, team } = req.body; //please give me these things
  try {
    let AIRCRAFT = await newUnit(name, facility, type, team); //just the facility ID
    res.status(200).send(AIRCRAFT);
  } catch (err) {
    res.status(404).send(err); //This returns a really weird json... watch out for that
  }
});
module.exports = router;
