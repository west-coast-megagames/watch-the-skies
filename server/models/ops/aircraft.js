const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:aircraftModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const AircraftSchema = new Schema({
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  mission: { type: String },
  location: { 
    zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
    country: { type: Schema.Types.ObjectId, ref: 'Country'},
    site: { type: Schema.Types.ObjectId, ref: 'Site' }
  },
  base: { type: Schema.Types.ObjectId, ref: 'Site'},
  status: {
    damaged: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    ready: { type: Boolean, default: true },
    upgrade: { type: Boolean, default: false },
    repair: { type: Boolean, default: false },
  }
});

AircraftSchema.methods.launch = async (aircraft, mission) => {
  const banking = require('../../wts/banking/banking');
  const { Account } = require('../gov/account');

  try {
    modelDebugger(`Attempting to launch ${aircraft.name}`)
    aircraft.status.deployed = true;
    aircraft.status.ready = false;

    modelDebugger(aircraft.status);

    let account = await Account.findOne({ name: 'Operations', 'team.team_id': aircraft.team.team_id });
    

    account = await banking.withdrawal(account, 1, `Deployment of ${aircraft.name} for ${mission.toLowerCase()}`)

    modelDebugger(account)
    await account.save();
    await aircraft.save();
    modelDebugger(`Aircraft ${aircraft.name} deployed...`);

    return aircraft;

  } catch (err) {
    modelDebugger('Error:', err.message);
  }
}

AircraftSchema.methods.validateAircraft = function (aircraft) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    type: Joi.string().min(2).max(50).required()
  };

  return Joi.validate(aircraft, schema, { "allowUnknown": true });
}

let Aircraft = mongoose.model('Aircraft', AircraftSchema);

function validateAircraft(aircraft) {
  //modelDebugger(`Validating ${aircraft.name}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required(),
      type: Joi.string().min(2).max(50).required()
    };
  
  return Joi.validate(aircraft, schema, { "allowUnknown": true });
};

async function getAircrafts() {
  modelDebugger('Retriving all aircraft documents...');
  let aircrafts = await Aircraft.find()
    .sort({team: 1})
    .populate('team', 'name shortName')
    .populate('location.zone', 'zoneName')
    .populate('location.country', 'name')
    .populate('systems', 'name category');
  return aircrafts;
};

async function updateStats(id) {
  let aircraft = await Aircraft.findById(id).populate('systems');
  let { stats } = aircraft
  for (let system of aircraft.systems) {
    for (let [key, value] of Object.entries(system.stats)) {
      if (typeof value === typeof 0) {
        console.log(`${key}: ${value}`);
        stats[key] = value; 
      }
    }
    console.log(`${system.name} loaded into ${aircraft.type}...`)
  }
  console.log(`All systems for ${aircraft.type} ${aircraft.name} leaded...`);
  aircraft.stats = stats;
  aircraft.markModified('stats');
  aircraft = await aircraft.save();
  console.log(aircraft.stats);

  return;
}

module.exports = { Aircraft, validateAircraft, getAircrafts, updateStats }