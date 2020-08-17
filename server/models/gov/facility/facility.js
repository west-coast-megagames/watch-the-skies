const mongoose = require("mongoose");
const modelDebugger = require("debug")("app:facilityModel");
const Schema = mongoose.Schema;
const Joi = require("joi");
const ObjectId = mongoose.ObjectId;

let FacTypes = ["Civilian", "Crises", "Hanger", "Research", "Base"];

const FacilitySchema = new Schema({
  model: { type: String, default: "Facility" },
  type: { type: String, min: 2, maxlength: 50 },
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: ObjectId, ref: "Team" },
  site: { type: ObjectId, ref: "Site" },
  code: {
    type: String,
    minlength: 2,
    maxlength: 20,
    required: true,
    unique: true,
  },
  status: {
    repair: { type: Boolean, default: true },
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    secret: { type: Boolean, default: false },
    defenses: { type: Boolean, default: false },
  },
  hidden: { type: Boolean, default: false },
  serviceRecord: [{ type: ObjectId, ref: "Log" }],
  gameState: [],
  capability: {
    research: {
      capacity: { type: Number, default: 0 },
      research: [{ type: ObjectId, ref: "Research" }],
      sciRate: { type: Number, default: 0 },
      sciBonus: { type: Number, default: 0 },
    },
    airMission: {
      capacity: { type: Number, default: 0 },
      aircraft: [{ type: ObjectId, ref: "Aircraft" }],
    },
    storage: {
      capacity: { type: Number, default: 0 },
      equipment: [{ type: ObjectId, ref: "Equipment" }],
    },
    manufacturing: {
      capacity: { type: Number, default: 0 },
      equipment: [{ type: ObjectId, ref: "Equipment" }],
    },
    naval: {
      capacity: { type: Number, default: 0 },
      fleet: [{ type: ObjectId, ref: "Military" }],
    },
    ground: {
      capacity: { type: Number, default: 0 },
      corps: [{ type: ObjectId, ref: "Military" }],
    },
  },
});

let Facility = mongoose.model("Facility", FacilitySchema);

function validateFacility(facility) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(facility, schema, { allowUnknown: true });
}

module.exports = {
  Facility,
  validateFacility,
};
