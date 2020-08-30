const mongoose = require("mongoose");
const modelDebugger = require("debug")("app:upgradeModel");
const Schema = mongoose.Schema;
const Joi = require("joi");

const UpgradeSchema = new Schema({
  model: { type: String, default: "Upgrade" },
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: Schema.Types.ObjectId, ref: "Team" },
  unitType: { type: String },
  manufacturer: { type: Schema.Types.ObjectId, ref: "Team" },
  cost: { type: Number },
  buildTime: { type: Number, default: 0 },
  buildCount: { type: Number, default: 0 },
  desc: { type: String },
  prereq: [
    {
      type: { type: String },
      code: { type: String },
    },
  ],
  status: {
    building: { type: Boolean, default: true },
    salvage: { type: Boolean, default: false },
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
  },
  serviceRecord: [{ type: Schema.Types.ObjectId, ref: "Log" }],
  gameState: [],
});

let Upgrade = mongoose.model("Upgrade", UpgradeSchema);

UpgradeSchema.methods.validateUpgrade = function (Upgrade) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(Upgrade, schema, { allowUnknown: true });
};

function validateUpgrade(Upgrade) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(Upgrade, schema, { allowUnknown: true });
}

const Gear = Upgrade.discriminator(
  "Gear",
  new Schema({
    type: { type: String, default: "Gear" },
    category: {
      type: String,
      enum: ["Weapons", "Vehicles", "Transport", "Training"],
    },
    stats: {
      healthMax: { type: Number },
      attack: { type: Number },
      defense: { type: Number },
      localDeploy: { type: Number },
      globalDeploy: { type: Number },
      invasion: { type: Number },
    },
  })
);

const Kit = Upgrade.discriminator(
  "Kit",
  new Schema({
    type: { type: String, default: "Kit" },
    code: { type: String },
    stats: { //will need to be updated
      sciRate: { type: Number },
      sciBonus: { type: Number },
      capacity: { type: Number },
    },
    effects: [
      {
        type: { type: String },
        effect: { type: Number },
      },
    ],
  })
);

const System = Upgrade.discriminator(
  "System",
  new Schema({
    type: { type: String, default: "System" },
    category: {
      type: String,
      enum: ["Weapon", "Engine", "Sensor", "Compartment", "Util"],
    },
    stats: {
      hullMax: { type: Number },
      attack: { type: Number },
      penetration: { type: Number },
      armor: { type: Number },
      shield: { type: Number },
      evade: { type: Number },
      range: { type: Number },
      cargo: { type: Number },
    },
  })
);

module.exports = { Upgrade, validateUpgrade, Gear, Kit, System };
