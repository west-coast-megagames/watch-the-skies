const mongoose = require("mongoose");
const modelDebugger = require("debug")("app:blueprintModel");
const Schema = mongoose.Schema;
const Joi = require("joi");
const ObjectId = mongoose.ObjectId;

const BlueprintSchema = new Schema({
  model: { type: String, default: "Blueprint" },
  name: { type: String, required: true, min: 2, maxlength: 50 },
  code: { type: String, minlength: 2, maxlength: 20, required: true },
  cost: { type: Number, required: true, default: 0 },
  buildTime: { type: Number, required: true, default: 0 },
  desc: {
    type: String,
    required: true,
    min: 1,
    maxlength: 255,
    default: "Blueprint",
  },
  prereq: [],
  hidden: { type: Boolean, required: true, default: false },
});

let Blueprint = mongoose.model("Blueprint", BlueprintSchema);

function validateBlueprint(blueprint) {
  const schema = {
    code: Joi.string().min(2).max(20).required().uppercase(),
    name: Joi.string().min(2).max(50).required(),
    cost: Joi.number().min(0).required(),
    buildTime: Joi.number().min(0).required(),
    desc: Joi.string().min(1).max(255).required(),
  };

  return Joi.validate(blueprint, schema, { allowUnknown: true });
}

const FacilityBlueprint = Blueprint.discriminator(
  "FacilityBlueprint",
  new Schema({
    buildModel: { type: String, required: true, default: "facility" },
    type: { type: Schema.Types.String },
    site: { type: ObjectId, ref: "Site" },
    upgrades: [Schema.Types.Mixed],
    capability: { type: Schema.Types.Mixed },
  })
);

function validateFacilityBlueprint(blueprint) {
  const schema = {
    code: Joi.string().min(2).max(20).required().uppercase(),
    name: Joi.string().min(2).max(50).required(),
    cost: Joi.number().min(0).required(),
    buildTime: Joi.number().min(0).required(),
    desc: Joi.string().min(1).max(255).required(),
  };

  return Joi.validate(blueprint, schema, { allowUnknown: true });
}

const AircraftBlueprint = Blueprint.discriminator(
  "AircraftBlueprint",
  new Schema({
    buildModel: { type: String, required: true, default: "aircraft" },
    stats: { type: Schema.Types.Mixed },
    type: { type: Schema.Types.String },
    upgrades: [Schema.Types.Mixed],
  })
);

function validateAircraftBlueprint(blueprint) {
  const schema = {
    code: Joi.string().min(2).max(20).required().uppercase(),
    name: Joi.string().min(2).max(50).required(),
    cost: Joi.number().min(0).required(),
    buildTime: Joi.number().min(0).required(),
    desc: Joi.string().min(1).max(255).required(),
  };

  return Joi.validate(blueprint, schema, { allowUnknown: true });
}

const SquadBlueprint = Blueprint.discriminator(
  "SquadBlueprint",
  new Schema({
    buildModel: { type: String, required: true, default: "squad" },
    unknown: { type: Schema.Types.Mixed }, //Squads don't exist yet...
  })
);

function validateSquadBlueprint(blueprint) {
  const schema = {
    code: Joi.string().min(2).max(20).required().uppercase(),
    name: Joi.string().min(2).max(50).required(),
    cost: Joi.number().min(0).required(),
    buildTime: Joi.number().min(0).required(),
    desc: Joi.string().min(1).max(255).required(),
  };

  return Joi.validate(blueprint, schema, { allowUnknown: true });
}

const UpgradeBlueprint = Blueprint.discriminator(
  "UpgradeBlueprint",
  new Schema({
    buildModel: { type: String, required: true, default: "upgrade" },
    unitType: { type: String, min: 2, maxlength: 50 },
    effects: [],
  })
);

function validateUpgradeBlueprint(blueprint) {
  const schema = {
    code: Joi.string().min(2).max(20).required().uppercase(),
    name: Joi.string().min(2).max(50).required(),
    cost: Joi.number().min(0).required(),
    buildTime: Joi.number().min(0).required(),
    desc: Joi.string().min(1).max(255).required(),
  };

  return Joi.validate(blueprint, schema, { allowUnknown: true });
}

module.exports = {
  Blueprint,
  validateBlueprint,
  FacilityBlueprint,
  validateFacilityBlueprint,
  AircraftBlueprint,
  validateAircraftBlueprint,
  SquadBlueprint,
  validateSquadBlueprint,
  UpgradeBlueprint,
  validateUpgradeBlueprint,
};
