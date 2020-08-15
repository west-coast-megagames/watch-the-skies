const express = require("express");
const router = express.Router();
const routeDebugger = require("debug")("app:routes:tableau");

// Mongoose Models - Database models
const {
  Aircraft,
  validateAircraft,
  updateStats,
} = require("../../models/ops/aircraft");
const { Article } = require("../../models/news/article");
const { Account } = require("../../models/gov/account");
const { Facility } = require("../../models/gov/facility/facility");
const { Military } = require("../../models/ops/military/military");
const { Country } = require("../../models/country");
const { Zone } = require("../../models/zone");
const { Team } = require("../../models/team/team");
const { Site } = require("../../models/sites/site");
const { Log } = require("../../models/logs/log");
const { Research } = require("../../models/sci/research");

// @route   GET /tableau/aircraft
// @Desc    Get all Aircrafts
// @access  Public
router.get("/aircraft", async function (req, res) {
  //console.log('Sending aircrafts somewhere...');
  let aircrafts = await Aircraft.find()
    .select("-systems -stats -status")
    .sort({ team: 1 })
    .populate("team", "name shortName")
    .populate("zone", "name")
    .populate("country", "name")
    .populate("site")
    .populate("origin");
  res.json(aircrafts);
});

// @route   GET /tableau/datadump
// @Desc    Get all Data
// @access  Public
router.get("/datadump", async function (req, res) {
  //console.log('Sending aircrafts somewhere...');
  let aircrafts = await Aircraft.find()
    .select("-systems -stats -status")
    .sort({ team: 1 })
    .populate("team", "name shortName")
    .populate("zone", "name")
    .populate("country", "name")
    .populate("site")
    .populate("origin");

  let accounts = await Account.find()
    .sort({ code: 1 })
    .populate("team", "name shortName");

  let countries = await Country.find()
    .sort("code: 1")
    .populate("team", "name shortName")
    .populate("zone", "name")
    .populate("borderedBy", "name");

  let zones = await Zone.find().populate("satellite", "name").sort("code: 1");

  let articles = await Article.find();

  let teams = await Team.find().sort({ team: 1 });

  let sites = await Site.find()
    .populate("country", "name")
    .populate("team", "shortName name")
    .populate("facilities", "name type")
    .populate("zone", "model name code")
    .sort({ name: -1 });

  let research = await Research.find().sort({ level: 1 }).sort({ field: 1 });

  let military = await Military.find()
    .sort({ team: 1 })
    .populate("team", "name shortName")
    .populate("zone", "name")
    .populate("country", "name")
    .populate("gear", "name category")
    .populate("site", "name")
    .populate("homeBase");

  let logs = await Log.find()
    .populate("team")
    .populate("country", "name")
    .populate("zone")
    .populate("project")
    .populate("lab")
    .populate("theory")
    .populate("units")
    .sort({ date: 1 });

  let facilities = await Facility.find()
    .populate("site", "name type")
    .populate("team", "shortName name sciRate")
    .populate("research")
    .populate("equipment");

  let data = {
    accounts,
    articles,
    aircrafts,
    countries,
    teams,
    zones,
    sites,
    research,
    military,
    logs,
    facilities,
  };
  res.json(data);
});

module.exports = router;
