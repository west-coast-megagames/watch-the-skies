const mongoose = require('mongoose');
const modelDebugger = require('debug')('app: Military Model');
const Schema = mongoose.Schema;
const Joi = require('joi');

const MilitarySchema = new Schema({
  model: { type: String, default: 'Military'},
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
  country: { type: Schema.Types.ObjectId, ref: 'Country'},
  site: { type: Schema.Types.ObjectId, ref: 'Site' },
  homeBase: { type: Schema.Types.ObjectId, ref: 'Country'},
  status: {
    damaged: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    repair: { type: Boolean, default: false },
  },
  gear: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }]
});

MilitarySchema.methods.deploy = async (unit ,country) => {
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
    await military.save();
    modelDebugger(`${unit.name} deployed...`);

    return unit;

  } catch (err) {
    modelDebugger('Error:', err.message);
  }
}

MilitarySchema.methods.validateMilitary = function (military) {
  const schema = {
    name: Joi.string().min(2).max(50).required()
  };

  return Joi.validate(military, schema, { "allowUnknown": true });
}

let Military = mongoose.model('Military', MilitarySchema);

function validateMilitary(military) {
  //modelDebugger(`Validating ${military.name}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required()
    };
  
  return Joi.validate(military, schema, { "allowUnknown": true });
};

async function updateStats(id) {
  let military = await Military.findById(id).populate('gear');
  let { stats } = military
  for (let gear of military.gear) {
    for (let [key, value] of Object.entries(gear.stats)) {
      if (typeof value === typeof 0) {
        console.log(`${key}: ${value}`);
        stats[key] = value; 
      }
    }
    console.log(`${gear.name} loaded into ${military.type}...`)
  }
  console.log(`All gear for ${military.type} ${military.name} loaded...`);
  military.stats = stats;
  military.markModified('stats');
  military = await military.save();
  console.log(military.stats);

  return;
}

module.exports = { Military, validateMilitary, updateStats }