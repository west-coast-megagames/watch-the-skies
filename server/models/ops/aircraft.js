const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:aircraftModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const AircraftSchema = new Schema({
  designation: { type: String, required: true, min: 2, maxlength: 50 },
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

AircraftSchema.methods.updateStats = function () {
  for (let system of this.systems) {
    for (let [key, value] of Object.entries(system.stats)) {
      this.stats[key] += value; 
    }
    console.log(`${system.name} loaded into ${this.type}...`)
  }
  console.log(`All systems for ${this.type} ${this.designation} leaded...`);
  console.log(this.stats);
}

AircraftSchema.methods.launch = async (aircraft, mission) => {
  const banking = require('../../wts/banking/banking');
  const { Account } = require('../gov/account');

  try {
    modelDebugger(`Attempting to launch ${aircraft.designation}`)
    aircraft.status.deployed = true;
    aircraft.status.ready = false;

    modelDebugger(aircraft.status);

    let account = await Account.findOne({ name: 'Operations', 'team.team_id': aircraft.team.team_id });
    

    account = await banking.withdrawal(account, 1, `Deployment of ${aircraft.designation} for ${mission.toLowerCase()}`)

    modelDebugger(account)
    await account.save();
    await aircraft.save();
    modelDebugger(`Aircraft ${aircraft.designation} deployed...`);

    return aircraft;

  } catch (err) {
    modelDebugger('Error:', err.message);
  }
}

AircraftSchema.methods.validateAircraft = function (aircraft) {
  const schema = {
    designation: Joi.string().min(2).max(50).required()
    /* there is no Type field here that I can see ... still in interceptor though
    type: Joi.string().min(2).max(50).required(),
    */
  };

  return Joi.validate(aircraft, schema, { "allowUnknown": true });
}

let Aircraft = mongoose.model('aircraft', AircraftSchema);

function validateAircraft(aircraft) {
  //modelDebugger(`Validating ${aircraft.designation}...`);

  const schema = {
      designation: Joi.string().min(2).max(50).required()
       /* there is no Type field that I can see  ... still in interceptor though
      type: Joi.string().min(2).max(50).required()
      */
    };
  
  return Joi.validate(aircraft, schema, { "allowUnknown": true });
};

async function getAircrafts() {
  modelDebugger('Retriving all aircraft documents...');
  let aircrafts = await AircraftSchema.find();
  return aircrafts;
};

module.exports = { Aircraft, validateAircraft, getAircrafts }