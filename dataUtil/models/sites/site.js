const mongoose = require("mongoose");
const Joi = require("joi");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const modelDebugger = require("debug")("app:spacecraftModel");

const SiteSchema = new Schema({
  model: { type: String, default: "Site" },
  name: { type: String, required: true, minlength: 2, maxlength: 50 },
  team: { type: Schema.Types.ObjectId, ref: "Team" },
  country: { type: Schema.Types.ObjectId, ref: "Country" },
  zone: { type: Schema.Types.ObjectId, ref: "Zone" },
  siteCode: {
    type: String,
    minlength: 2,
    maxlength: 20,
    required: true,
    unique: true,
  },
  geoDMS: {
    latDMS: { type: String, minlength: 7, maxlength: 13 }, // format DD MM SS.S N or S  example  40 44 55.02 N
    longDMS: { type: String, minlength: 7, maxlength: 14 }, // format DDD MM SS.S E or W example 073 59 11.02 W
  },
  geoDecimal: {
    latDecimal: { type: Number, min: -90, max: 90 }, // Positive is North, Negative is South
    longDecimal: { type: Number, min: -180, max: 180 }, // Postive is East, Negative is West
  },
  hidden: { type: Boolean, default: false }, // just in case and to be consistent
  facilities: [{ type: Schema.Types.ObjectId, ref: "Facility" }],
  coastal: {
    type: Boolean,
    default: false,
  },
});

let Site = mongoose.model("Site", SiteSchema);

SiteSchema.methods.validateSite = function (site) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    siteCode: Joi.string().min(2).max(20).required(),
  };

  return Joi.validate(baseSite, schema, { allowUnknown: true });
};

function validateSite(site) {
  //modelDebugger(`Validating ${site.siteCode}...`);

  const schema = {
    name: Joi.string().min(2).max(50).required(),
    siteCode: Joi.string().min(2).max(20).required(),
  };

  return Joi.validate(site, schema, { allowUnknown: true });
}

const CitySite = Site.discriminator(
  "CitySite",
  new Schema({
    type: { type: String, default: "City" },
    dateline: { type: String, default: "Dateline" },
  })
);

function validateCity(citySite) {
  //modelDebugger(`Validating ${citySite.cityName}...`);

  const schema = {
    name: Joi.string().min(2).max(50).required(),
    siteCode: Joi.string().min(2).max(20).required(),
  };

  return Joi.validate(citySite, schema, { allowUnknown: true });
}

const BaseSite = Site.discriminator(
  "BaseSite",
  new Schema({
    type: { type: String, default: "Base" },
    defenses: { type: Boolean, default: false },
    public: { type: Boolean, default: false },
  })
);

function validateBase(baseSite) {
  //modelDebugger(`Validating ${baseSite.baseName}...`);

  const schema = {
    name: Joi.string().min(2).max(50).required(),
    siteCode: Joi.string().min(2).max(20).required(),
  };

  return Joi.validate(baseSite, schema, { allowUnknown: true });
}

const CrashSite = Site.discriminator(
  "Crash",
  new Schema({
    type: { type: String, default: "Crash" },
    salvage: [{ type: Schema.Types.ObjectId, ref: "System" }],
    status: {
      public: { type: Boolean, default: false },
      secret: { type: Boolean, default: false },
    },
  })
);

function validateCrash(crashSite) {
  //modelDebugger(`Validating ${crashSite.crashName}...`);

  const schema = {
    name: Joi.string().min(2).max(50).required(),
    siteCode: Joi.string().min(2).max(20).required(),
  };

  return Joi.validate(crashSite, schema, { allowUnknown: true });
}

const Spacecraft = Site.discriminator(
  "Spacecraft",
  new Schema({
    type: { type: String, default: "Spacecraft" },
    shipType: {
      type: String,
      required: true,
      min: 2,
      maxlength: 50,
      enum: ["Satellite", "Cruiser", "Battleship", "Hauler", "Station"],
    },
    status: {
      damaged: { type: Boolean, default: false },
      destroyed: { type: Boolean, default: false },
      upgrade: { type: Boolean, default: false },
      repair: { type: Boolean, default: false },
      secret: { type: Boolean },
    },
  })
);

function validateSpacecraft(spacecraft) {
  //modelDebugger(`Validating ${spacecraft.name}...`);

  const schema = {
    name: Joi.string().min(2).max(50).required(),
    siteCode: Joi.string().min(2).max(20).required(),
  };

  return Joi.validate(spacecraft, schema, { allowUnknown: true });
}

async function getSpacecraft() {
  modelDebugger("Retriving all spacecraft documents...");
  let spacecrafts = await Spacecraft.find();
  return spacecrafts;
}

async function launchSpacecraft(spacecraft) {
  const banking = require("../../wts/banking/banking");
  const { Account } = require("../gov/account");

  try {
    modelDebugger(`Attempting to launchSpacecraft ${spacecraft.name}`);
    spacecraft.status.deployed = true;
    spacecraft.status.ready = false;
    spacecraft.mission = "Deployed";

    modelDebugger(spacecraft);

    let account = await Account.findOne({
      name: "Operations",
      "team.team_id": spacecraft.team.team_id,
    });
    console.log(account);

    account = banking.withdrawal(
      account,
      1,
      `Deployment of ${spacecraft.name}`
    );

    await account.save();
    await spacecraft.save();
    console.log(`Spacecraft ${spacecraft.name} deployed...`);

    return;
  } catch (err) {
    modelDebugger("Error:", err.message);
  }
}

module.exports = {
  Site,
  validateSite,
  CitySite,
  validateCity,
  BaseSite,
  validateBase,
  CrashSite,
  validateCrash,
  Spacecraft,
  launchSpacecraft,
  validateSpacecraft,
  getSpacecraft,
};
