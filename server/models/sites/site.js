const mongoose = require("mongoose");
const Joi = require("joi");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const modelDebugger = require("debug")("app:spacecraftModel");

const SiteSchema = new Schema({
  model: { type: String, default: "Site" },
  name: { type: String, required: true, minlength: 2, maxlength: 50 },
  team: { type: ObjectId, ref: "Team" },
  country: { type: ObjectId, ref: "Country" },
  zone: { type: ObjectId, ref: "Zone" },
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
  facilities: [{ type: ObjectId, ref: "Facility" }],
  coastal: {
    type: Boolean,
    default: false,
  },
  serviceRecord: [{ type: ObjectId, ref: "Log" }],
  gameState: [],
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

const CrashSite = Site.discriminator(
  "Crash",
  new Schema({
    type: { type: String, default: "Crash" },
    salvage: [{ type: ObjectId, ref: "System" }],
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

module.exports = {
  Site,
  validateSite,
  CitySite,
  validateCity,
  CrashSite,
  validateCrash,
};
