const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const InterceptorSchema = new Schema({
  designation: { type: String, required: true, min: 2, maxlength: 50 },
  type: { type: String, required: true, min: 2, maxlength: 50, default: "Interceptor"} ,
  team: { 
    teamName: { type: String, minlength: 2, maxlength: 50, default: "UN-Assigned" },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team'}
  },
  stats: {
    hull: { type: Number, default: 2 },
    hullMax: { type: Number, default: 2 },
    damage: { type: Number, default: 1 },
    passiveRolls: [Number],
    activeRolls: [Number]
  },
  location: { 
    zone: { 
      zoneName: { type: String, default: "UN-Assigned" },
      zoneId: { type: Schema.Types.ObjectId, ref: 'Zone'}
    },
    country: { 
      countryName: { type: String, default: "UN-Assigned" },
      countryId: { type: Schema.Types.ObjectId, ref: 'Country'}
    },
    poi: { type: String }
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
    mission: { type: Boolean, default: false }
  }
});

InterceptorSchema.methods.validateInterceptor = function (interceptor) {
  const schema = {
    designation: Joi.string().min(2).max(50).required(),
    type: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(interceptor, schema, { "allowUnknown": true });
}

let Interceptor = mongoose.model('interceptor', InterceptorSchema);

function validateInterceptor(interceptor) {
  //modelDebugger(`Validating ${interceptor.designation}...`);

  const schema = {
      designation: Joi.string().min(2).max(50).required(),
      type: Joi.string().min(2).max(50).required()
    };
  
  return Joi.validate(interceptor, schema, { "allowUnknown": true });
};

const { getTeam } = require('../team');
const banking = require('../../util/systems/banking/banking');

async function launch (aircraft) {
  try {
    console.log(`Attempting to launch ${aircraft.designation}`)
    aircraft.status.deployed = true;
    aircraft.status.ready = false;
    aircraft.status.mission = true;

    console.log(aircraft);

    let team = await getTeam(aircraft.team.teamId);

    let account = banking.withdrawl(team._id, team.teamName, team.accounts, 'Operations', 1, `Deployment of ${aircraft.designation}`)
    team.accounts = account;

    await team.save();
    await aircraft.save();
    console.log(`Aircraft ${aircraft.designation} deployed...`);
    return 0;
  } catch {

  }
}

module.exports = { Interceptor, launch, validateInterceptor }