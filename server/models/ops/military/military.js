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
  equipment: {
    weapons: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    vehicles: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    transports: { type: Schema.Types.ObjectId, ref: 'Equipment' }
  },
  training: { type: Schema.Types.ObjectId, ref: 'Equipment' }
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
    await aircraft.save();
    modelDebugger(`${unit.name} deployed...`);

    return unit;

  } catch (err) {
    modelDebugger('Error:', err.message);
  }
}

let Military = mongoose.model('Military', MilitarySchema);

module.exports = { Military}