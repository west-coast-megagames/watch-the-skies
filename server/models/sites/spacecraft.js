const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:spacecraftModel');
const Schema = mongoose.Schema;
const Joi = require('joi');
const { Site } = require('./site');

const Spacecraft = Site.discriminator('Spacecraft', new Schema({
  type: { type: String, default: 'Spacecraft' },
  shipType: { 
    type: String,
    required: true,
    min: 2, 
    maxlength: 50,
    enum: ["Satellite", "Cruiser", "Battleship", "Hauler", "Station"]},
  status: {
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    upgrade: { type: Boolean, default: false },
    repair: { type: Boolean, default: false },
    secret: { type: Boolean }
  }
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
    spacecraft.mission = "Deployed";

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

module.exports = { Spacecraft, launchSpacecraft, validateSpacecraft, getSpacecraft }