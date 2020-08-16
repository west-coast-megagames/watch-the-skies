const mongoose = require("mongoose");
const Joi = require("joi");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const modelDebugger = require("debug")("app:spacecraftModel");

const SpaceSchema = new Schema({
  model: { type: String, default: "Spacecraft" },
  name: { type: String, required: true, minlength: 2, maxlength: 50 },
  team: { type: ObjectId, ref: "Team" },
  country: { type: ObjectId, ref: "Country" },
  zone: { type: ObjectId, ref: "Zone" },
  spacecraftCode: {
    type: String,
    minlength: 2,
    maxlength: 20,
    required: true,
    unique: true,
  },
  hidden: { type: Boolean, default: false }, // just in case and to be consistent
  facilities: [{ type: ObjectId, ref: "Facility" }],
  serviceRecord: [{ type: ObjectId, ref: "Log" }],
  gameState: [],
  site: [{ type: ObjectId, ref: "Site" }],
  type: {
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
});

let Spacecraft = mongoose.model("Spacecraft", SpaceSchema);

SpaceSchema.methods.validateSpacecraft = function (spacecraft) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    spacecraftCode: Joi.string().min(2).max(20).required(),
  };

  return Joi.validate(baseSpacecraft, schema, { allowUnknown: true });
};

function validateSpacecraft(spacecraft) {
  //modelDebugger(`Validating ${site.spacecraftCode}...`);

  const schema = {
    name: Joi.string().min(2).max(50).required(),
    spacecraftCode: Joi.string().min(2).max(20).required(),
  };

  return Joi.validate(site, schema, { allowUnknown: true });
}

module.exports = {
  Spacecraft,
  validateSpacecraft,
};
