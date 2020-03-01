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

/* No more stats to update
async function updateStats(id) {
  let spacecraft = await Spacecraft.findById(id).populate('systems');
  if (!spacecraft) {
    modelDebugger(`Spacecraft not available for updateStats ${id}`);
    return;
  }
  let { stats } = spacecraft
  console.log("Jeff 1 here ... stats ", stats);
  for (let system of spacecraft.systems) {
    console.log("jeff 2 ... system ", system);
    for (let [key, value] of Object.entries(system.stats)) {
      console.log("jeff3 ... key", key, "value" , value, "type of value ", typeof value);
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
*/

module.exports = { Spacecraft, launchSpacecraft, validateSpacecraft, getSpacecraft }