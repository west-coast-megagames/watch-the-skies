const Joi = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const zoneDebugger = require("debug")("app:zone");
const supportsColor = require("supports-color");

const ZoneSchema = new Schema({
  model: { type: String, default: "Zone" },
  code: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 2,
    uppercase: true,
    index: true,
    unique: true,
  },
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  terror: {
    type: Number,
    min: 0,
    max: 250,
    default: 0,
  },
  satellite: [{ type: Schema.Types.ObjectId, ref: "Site" }],
  serviceRecord: [{ type: Schema.Types.ObjectId, ref: "Log" }],
  gameState: [],
});

ZoneSchema.methods.validateZone = function (zone) {
  //zoneDebugger("In methods validateZone", zone.name, zone.code);
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    code: Joi.string().min(2).max(2).required().uppercase(),
    terror: Joi.number().min(0).max(250),
  };

  return Joi.validate(zone, schema, { allowUnknown: true });
  //return Joi.schema.validate(zone, { "allowUnknown": true });
};

let Zone = mongoose.model("Zone", ZoneSchema);

function validateZone(zone) {
  //zoneDebugger("In function validateZone", zone.name);
  const schema = {
    code: Joi.string().min(2).max(2).required().uppercase(),
    name: Joi.string().min(3).max(50).required(),
    terror: Joi.number().min(0).max(250),
  };

  //return Joi.schema.validate(zone, { "allowUnknown": true });
  return Joi.validate(zone, schema, { allowUnknown: true });
}

module.exports = { Zone, validateZone };
