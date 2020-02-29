const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:SquadModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const SquadSchema = new Schema({
  model: { type: String, default: 'Squad'},
  type: { type: String, default: 'Raid',
    enum: ["Raid", "Assault", "Infiltration", "Envoy", "Science"]},
  name: { type: String, required: true, min: 2, maxlength: 50, unique: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
  country: { type: Schema.Types.ObjectId, ref: 'Country'},
  site: { type: Schema.Types.ObjectId, ref: 'Site' },
  homeBase: { type: Schema.Types.ObjectId, ref: 'Site'},
  status: {
    damaged: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    repair: { type: Boolean, default: false },
    secret: { type: Boolean }
  },
  gear: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }]
});

SquadSchema.methods.deploy = async (unit ,country) => {
  const banking = require('../../../wts/banking/banking');
  const { Account } = require('../../gov/account');

  try {
    modelDebugger(`Deploying ${unit.name} to ${country.name} in the ${country.zone.name} zone`);
    let cost = 0;
    if (unit.zone !== country.zone) {
        cost = unit.status.localDeploy;
        unit.status.deployed = true;
    } else if (unit.zone === country.zone) {
        cost = unit.status.globalDeploy;
        unit.status.deployed = true;
    };

    let account = await Account.findOne({ name: 'Operations', 'team': unit.team });
    account = await banking.withdrawal(account, cost, `Deploying ${unit.name} to ${country.name.toLowerCase()} in the ${country.zone.name.toLowerCase()} zone`);

    modelDebugger(account)
    await account.save();
    await squad.save();
    modelDebugger(`${unit.name} deployed...`);

    return unit;

  } catch (err) {
    modelDebugger('Error:', err.message);
  }
}

SquadSchema.methods.validateSquad = function (squad) {
  const schema = {
    name: Joi.string().min(2).max(50).required()
  };

  return Joi.validate(squad, schema, { "allowUnknown": true });
}

let Squad = mongoose.model('Squad', SquadSchema);

function validateSquad(squad) {
  //modelDebugger(`Validating ${squad.name}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required()
    };
  
  return Joi.validate(squad, schema, { "allowUnknown": true });
};

async function updateStats(id) {
  let squad = await Squad.findById(id).populate('gear');
  let { stats } = squad
  for (let gear of squad.gear) {
    for (let [key, value] of Object.entries(gear.stats)) {
      if (typeof value === typeof 0) {
        console.log(`${key}: ${value}`);
        stats[key] = value; 
      }
    }
    console.log(`${gear.name} loaded into ${squad.type}...`)
  }
  console.log(`All gear for ${squad.type} ${squad.name} loaded...`);
  squad.stats = stats;
  squad.markModified('stats');
  squad = await squad.save();
  console.log(squad.stats);

  return;
}

module.exports = { Squad, validateSquad, updateStats }