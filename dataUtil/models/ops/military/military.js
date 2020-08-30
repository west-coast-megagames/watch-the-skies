const mongoose = require("mongoose");
const modelDebugger = require("debug")("app: Military Model");
const Schema = mongoose.Schema;
const Joi = require("joi");

const MilitarySchema = new Schema({
  model: { type: String, default: "Military" },
  name: { type: String, required: true, min: 2, maxlength: 50, unique: true },
  team: { type: Schema.Types.ObjectId, ref: "Team" },
  zone: { type: Schema.Types.ObjectId, ref: "Zone" },
  country: { type: Schema.Types.ObjectId, ref: "Country" },
  site: { type: Schema.Types.ObjectId, ref: "Site" },
  origin: { type: Schema.Types.ObjectId, ref: "Facility" },
  status: {
    damaged: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    repair: { type: Boolean, default: false },
    secret: { type: Boolean, default: false },
  },
  hidden: { type: Boolean, default: false },
  gear: [{ type: Schema.Types.ObjectId, ref: "Upgrade" }],
  serviceRecord: [{ type: Schema.Types.ObjectId, ref: "Log" }],
  gameState: [],
});

let Military = mongoose.model("Military", MilitarySchema);

const Fleet = Military.discriminator(
  "Fleet",
  new Schema({
    type: { type: String, default: "Fleet" },
    stats: {
      health: { type: Number, default: 4 },
      healthMax: { type: Number, default: 4 },
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 2 },
      localDeploy: { type: Number, default: 2 },
      globalDeploy: { type: Number, default: 5 },
      invasion: { type: Number, default: 2 },
    },
  })
);

const Corps = Military.discriminator(
  "Corps",
  new Schema({
    type: { type: String, default: "Corps" },
    stats: {
      health: { type: Number, default: 2 },
      healthMax: { type: Number, default: 2 },
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 2 },
      localDeploy: { type: Number, default: 2 },
      globalDeploy: { type: Number, default: 5 },
      invasion: { type: Number, default: 2 },
    },
  })
);

MilitarySchema.methods.deploy = async (unit, country) => {
  const banking = require("../../../wts/banking/banking");
  const { Account } = require("../../gov/account");

  try {
    modelDebugger(
      `Deploying ${unit.name} to ${country.name} in the ${country.zone.name} zone`
    );
    let cost = 0;
    if (unit.zone !== country.zone) {
      cost = unit.status.localDeploy;
      unit.status.deployed = true;
    } else if (unit.zone === country.zone) {
      cost = unit.status.globalDeploy;
      unit.status.deployed = true;
    }

    let account = await Account.findOne({
      name: "Operations",
      team: unit.team,
    });
    account = await banking.withdrawal(
      account,
      cost,
      `Deploying ${
        unit.name
      } to ${country.name.toLowerCase()} in the ${country.zone.name.toLowerCase()} zone`
    );

    modelDebugger(account);
    await account.save();
    await military.save();
    modelDebugger(`${unit.name} deployed...`);

    return unit;
  } catch (err) {
    modelDebugger("Error:", err.message);
  }
};

MilitarySchema.methods.validateMilitary = function (military) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(military, schema, { allowUnknown: true });
};

function validateMilitary(military) {
  //modelDebugger(`Validating ${military.name}...`);

  const schema = {
    name: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(military, schema, { allowUnknown: true });
}

async function updateStats(id) {
  let military = await Military.findById(id).populate("gear");
  let { stats } = military;
  for (let gear of military.gear) {
    for (let [key, value] of Object.entries(gear.stats)) {
      if (typeof value === typeof 0) {
        console.log(`${key}: ${value}`);
        stats[key] = value;
      }
    }
    console.log(`${gear.name} loaded into ${military.type}...`);
  }
  console.log(`All gear for ${military.type} ${military.name} loaded...`);
  military.stats = stats;
  military.markModified("stats");
  military = await military.save();
  console.log(military.stats);

  return;
}

module.exports = { Military, validateMilitary, updateStats, Fleet, Corps };
