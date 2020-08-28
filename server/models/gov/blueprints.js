const mongoose = require("mongoose");
const modelDebugger = require("debug")("app:blueprintModel");
const Schema = mongoose.Schema;
const Joi = require("joi");
const ObjectId = mongoose.ObjectId;

const BlueprintSchema = new Schema({
  model: { type: String, required: true, default: "Blueprint" },
  name: { type: String, required: true, min: 2, maxlength: 50 },
  code: { type: String, minlength: 2, maxlength: 20, required: true, unique: true },  
  cost: { type: Number, required: true, default: 0 },
  buildTime: { type: Number, required: true, default: 0 },
  desc: { type: String, required: true, default: "Blueprint" },
  prereq: [],
  hidden: { type: Boolean, required: true, default: false },
});

let Blueprint = mongoose.model("Blueprint", BlueprintSchema);

const FacilityBlueprint = Blueprint.discriminator('FacilityBlueprint', new Schema({
  site: { type: ObjectId, ref: "Site" },
  capability: { type: Schema.Types.Mixed }
}));

const AircraftBlueprint = Blueprint.discriminator('AircraftBlueprint', new Schema({
  stats: { type: Schema.Types.Mixed }
}));

const SquadBlueprint = Blueprint.discriminator('SquadBlueprint', new Schema({
  unknown: { type: Schema.Types.Mixed } //Squads don't exist yet...
}));

const UpgradeBlueprint = Blueprint.discriminator('UpgradeBlueprint', new Schema({
  unknown: { type: Schema.Types.Mixed } //Upgrades don't exist yet...
}));

module.exports = { Blueprint, FacilityBlueprint, AircraftBlueprint, SquadBlueprint, UpgradeBlueprint };