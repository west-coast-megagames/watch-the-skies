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
  desc: { type: String, required: true, default: "Blueprint" },
  prereq: [],
  hidden: { type: Boolean, required: true, default: false },
});

let Blueprint = mongoose.model("Blueprint", BlueprintSchema);

const FacilityBlueprint = Blueprint.discriminator(
  "FacilityBlueprint",
  new Schema({
    buildModel: { type: String, required: true, default: "facility" },
    site: { type: ObjectId, ref: "Site" },
    upgrades: [Schema.Types.Mixed],
    capability: { type: Schema.Types.Mixed },
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
    unknown: { type: Schema.Types.Mixed }, //Squads don't exist yet...
  })
);

const UpgradeBlueprint = Blueprint.discriminator(
  "UpgradeBlueprint",
  new Schema({
    buildModel: { type: String, required: true, default: "upgrade" },
    unitType: { type: String, min: 2, maxlength: 50 },
  })
);

module.exports = {
  Blueprint,
  FacilityBlueprint,
  AircraftBlueprint,
  SquadBlueprint,
  UpgradeBlueprint,
};
