const { Blueprint } = require("../models/blueprint");
const { Zone } = require("../models/zone");
const { Country } = require("../models/country");
const { Team } = require("../models/team");
const { Research } = require("../models/research");
const { Log } = require("../models/logs/log");
const { Site } = require("../models/site");
const { Aircraft } = require("../models/aircraft");
const { Account } = require("../models/account");
const { Upgrade } = require("../models/upgrade");
const { Facility } = require("../models/facility");
const { Military } = require("../models/military");
const { Squad } = require("../models/squad");
const { User } = require("../models/user");
const { Article } = require("../models/article");
const { LogError } = require("../models/loggers/logError");
const { LogInfo } = require("../models/loggers/logInfo");

async function dropAll(doDrop) {
  if (!doDrop) return;

  // drop all tables
  await Blueprint.deleteMany();
  await Zone.deleteMany();
  await Country.deleteMany();
  await Team.deleteMany();
  await Site.deleteMany();
  await Account.deleteMany();
  await Aircraft.deleteMany();
  await Upgrade.deleteMany();
  await Facility.deleteMany();
  await Military.deleteMany();
  await Research.deleteMany();
  await Log.deleteMany();
  await Squad.deleteMany();
  await User.deleteMany();
  await Article.deleteMany();
  await LogError.deleteMany();
  await LogInfo.deleteMany();

  return true;
}

module.exports = dropAll;
