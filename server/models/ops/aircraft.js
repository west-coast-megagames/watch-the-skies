const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:aircraftModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const AircraftSchema = new Schema({
  model: { type: String, default: 'Aircraft'},
  type: { type: String, min: 2, maxlength: 50, default: 'Interceptor'},
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
  country: { type: Schema.Types.ObjectId, ref: 'Country'},
  site: { type: Schema.Types.ObjectId, ref: 'Site' },
  baseOrig: { type: Schema.Types.ObjectId, ref: 'Site'},
  status: {
    damaged: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    ready: { type: Boolean, default: true },
    upgrade: { type: Boolean, default: false },
    repair: { type: Boolean, default: false },
    mission: { type: String }
  },
  loadout: {
    cpu: { type: Number, default: 1 },
    weapons: { type: Number, default: 1 },
    engines: { type: Number, default: 1 },
    sensors: { type: Number, default: 1 },
    compartments: { type: Number, default: 1 },
    utils: { type: Number, default: 1 },
  },
  systems: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }],
  stats: {
    hull: { type: Number, default: 3 },
    hullMax: { type: Number, default: 3 },
    attack: { type: Number, default: 0 },
    penetration: { type: Number, default: 0 },
    armor: { type: Number, default: 0 },
    evade: { type: Number, default: 0 },
    range: { type: Number, default: 0 },
    cargo: { type: Number, default: 0 },
    passiveRolls: [Number],
    activeRolls: [Number]
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

AircraftSchema.methods.returnToBase = async (aircraft) => {
  modelDebugger(`Returning ${aircraft.name} to ${baseOrig.name}...`);
  aircraft.mission = "Docked";
  aircraft.status.ready = true;
  aircraft.status.deployed = false;
  aircraft.country = update.baseOrig.country;
  aircraft.site = update.baseOrig._id;
  aircraft.zone = update.baseOrig.zone;

  aircraft = await aircraft.save();

  return aircraft;
}


AircraftSchema.methods.validateAircraft = function (aircraft) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    type: Joi.string().min(2).max(50)
  };

  return Joi.validate(aircraft, schema, { "allowUnknown": true });
}

let Aircraft = mongoose.model('Aircraft', AircraftSchema);

function validateAircraft(aircraft) {
  //modelDebugger(`Validating ${aircraft.name}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required(),
      type: Joi.string().min(2).max(50)
    };
  
  return Joi.validate(aircraft, schema, { "allowUnknown": true });
};

async function getAircrafts() {
  modelDebugger('Retriving all aircraft documents...');
  let aircrafts = await Aircraft.find()
    .sort({team: 1})
    .populate('team', 'name shortName')
    .populate('zone', 'zoneName')
    .populate('country', 'name')
    .populate('systems', 'name category')
    .populate('baseOrig', 'name');
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
  console.log(`All systems for ${aircraft.type} ${aircraft.name} loaded...`);
  aircraft.stats = stats;
  aircraft.markModified('stats');
  aircraft = await aircraft.save();
  console.log(aircraft.stats);

  return;
}

module.exports = { Aircraft, validateAircraft, getAircrafts, updateStats }