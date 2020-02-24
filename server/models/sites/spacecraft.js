const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:spacecraftModel');
const Schema = mongoose.Schema;
const Joi = require('joi');
const { Site } = require('./site');

const Spacecraft = Site.discriminator('Spacecraft', new Schema({
  type: { type: String, default: 'Spacecraft' },
  name: { type: String, required: true, minlength: 2, maxlength: 50 },
  shipType: { 
    type: String,
    required: true,
    min: 2, 
    maxlength: 50,
    enum: ["Satellite", "Spacecraft", "Gunship", "Transport", "Hauler", "Decoy"], 
    default: "Spacecraft"} ,
  stats: {
    hull: { type: Number, default: 2 },
    hullMax: { type: Number, default: 2 },
    damage: { type: Number, default: 1 },
    passiveRolls: [Number],
    activeRolls: [Number]
  },
  status: {
    aggressive: { type: Boolean, default: true },
    passive: { type: Boolean, default: false },
    disengage: { type: Boolean, default: false },
    damaged: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    ready: { type: Boolean, default: true },
    upgrade: { type: Boolean, default: false },
    repair: { type: Boolean, default: false },
    mission: { type: String }
  },
  systems: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }]
}));

function validateSpacecraft(spacecraft) {
  //modelDebugger(`Validating ${spacecraft.name}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required(),
      siteCode: Joi.string().min(2).max(20).required()
    };
  
  return Joi.validate(spacecraft, schema, { "allowUnknown": true });
};

async function getSpacecraft() {
  modelDebugger('Retriving all spacecraft documents...');
  let spacecrafts = await Spacecraft.find();
  return spacecrafts;
};

async function launchSpacecraft (spacecraft) {
  const banking = require('../../wts/banking/banking');
  const { Account } = require('../gov/account');

  try {
    modelDebugger(`Attempting to launchSpacecraft ${spacecraft.name}`)
    spacecraft.status.deployed = true;
    spacecraft.status.ready = false;
    spacecraft.status.mission = true;

    modelDebugger(spacecraft);

    let account = await Account.findOne({ name: 'Operations', 'team.team_id': spacecraft.team.team_id });
    console.log(account)

    account = banking.withdrawal(account, 1, `Deployment of ${spacecraft.name}`)

    await account.save();
    await spacecraft.save();
    console.log(`Spacecraft ${spacecraft.name} deployed...`);

    return;

  } catch (err) {
    modelDebugger('Error:', err.message);
  }
}

async function updateStats(id) {
  let spacecraft = await Spacecraft.findById(id).populate('systems');
  let { stats } = spacecraft
  for (let system of spacecraft.systems) {
    for (let [key, value] of Object.entries(system.stats)) {
      if (typeof value === typeof 0) {
        console.log(`${key}: ${value}`);
        stats[key] = value; 
      }
    }
    console.log(`${system.name} loaded into ${spacecraft.type}...`)
  }
  console.log(`All systems for ${spacecraft.type} ${spacecraft.name} loaded...`);
  spacecraft.stats = stats;
  spacecraft.markModified('stats');
  spacecraft = await spacecraft.save();
  console.log(spacecraft.stats);

  return;
}

module.exports = { Spacecraft, launchSpacecraft, validateSpacecraft, getSpacecraft, updateStats }