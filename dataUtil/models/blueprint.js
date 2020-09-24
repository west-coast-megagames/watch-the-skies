const mongoose = require("mongoose"); // Mongo DB object modeling module
const Joi = require("joi"); // Schema description & validation module
const { logger } = require("../middleware/log/winston"); // Loging midddleware
const nexusError = require("../middleware/util/throwError"); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId;

const BlueprintSchema = new Schema({
  model: { type: String, default: "Blueprint" },
  name: { type: String, min: 2, maxlength: 50, required: true },
  code: { type: String, minlength: 2, maxlength: 20, required: true },
  cost: { type: Number, default: 0 },
  buildTime: { type: Number, default: 0 },
  desc: {
    type: String,
    min: 1,
    maxlength: 255,
    default: "Blueprint",
  },
  prereq: [],
  hidden: { type: Boolean, default: false },
});

// validateArticle method
BlueprintSchema.methods.validateBlueprint = async function () {
  logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);

  const schema = {
    code: Joi.string().min(2).max(20).required().uppercase(),
    name: Joi.string().min(2).max(50).required(),
    cost: Joi.number().min(0).required(),
    buildTime: Joi.number().min(0).required(),
    desc: Joi.string().min(1).max(255).required(),
  };

  const { error } = Joi.validate(this, schema, { allowUnknown: true });
  if (error != undefined) nexusError(`${error}`, 400);
};

const Blueprint = mongoose.model("Blueprint", BlueprintSchema);

const FacilityBlueprint = Blueprint.discriminator(
  "FacilityBlueprint",
  new Schema({
    buildModel: { type: String, required: true, default: "facility" },
    type: { type: String },
    site: { type: ObjectId, ref: "Site" },
    upgrades: [Schema.Types.Mixed],
    capacity: { type: Number, default: 0 },
    status: { type: Schema.Types.Mixed },
    unitType: [{ type: String, min: 2, maxlength: 50 }],
    funding: [Number],
    sciRate: { type: Number, default: 0 },
    sciBonus: { type: Number, default: 0 },
  })
);

const AircraftBlueprint = Blueprint.discriminator(
  "AircraftBlueprint",
  new Schema({
    buildModel: { type: String, required: true, default: "aircraft" },
    stats: { type: Schema.Types.Mixed },
    type: { type: Schema.Types.String },
    upgrades: [Schema.Types.Mixed],
  })
);

const SquadBlueprint = Blueprint.discriminator(
  "SquadBlueprint",
  new Schema({
    buildModel: { type: String, required: true, default: "squad" },
    unknown: { type: Schema.Types.Mixed }, // Squads don't exist yet...
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
    unitType: [{ type: String, min: 2, maxlength: 50 }],
    effects: [],
    stats: { type: Schema.Types.Mixed },
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
