const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:interceptorModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const SpacecraftSchema = new Schema({
  name: { type: String, required: true, min: 2, maxlength: 50 },
  type: { 
    type: String,
    required: true,
    min: 2, 
    maxlength: 50,
    enum: ["Satellite", "Interceptor", "Gunship", "Transport", "Hauler", "Decoy"], 
    default: "Interceptor"} ,
  stats: {
    hull: { type: Number, default: 2 },
    hullMax: { type: Number, default: 2 },
    damage: { type: Number, default: 1 },
    passiveRolls: [Number],
    activeRolls: [Number]
  },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  mission: { type: String }, 
  zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
  country: { type: Schema.Types.ObjectId, ref: 'Country'},
  site: { type: Schema.Types.ObjectId, ref: 'Site' },
  base: { type: Schema.Types.ObjectId, ref: 'Site'},
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

SpacecraftSchema.methods.validateInterceptor = function (interceptor) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    type: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(interceptor, schema, { "allowUnknown": true });
}

let Interceptor = mongoose.model('interceptor', SpacecraftSchema);

function validateInterceptor(interceptor) {
  //modelDebugger(`Validating ${interceptor.name}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required(),
      type: Joi.string().min(2).max(50).required()
    };
  
  return Joi.validate(interceptor, schema, { "allowUnknown": true });
};

async function getAircrafts() {
  modelDebugger('Retriving all aircraft documents...');
  let interceptors = await Interceptor.find();
  return interceptors;
};

async function launch (aircraft) {
  const banking = require('../../wts/banking/banking');
  const { Account } = require('../gov/account');

  try {
    modelDebugger(`Attempting to launch ${aircraft.name}`)
    aircraft.status.deployed = true;
    aircraft.status.ready = false;
    aircraft.status.mission = true;

    modelDebugger(aircraft);

    let account = await Account.findOne({ name: 'Operations', 'team.team_id': aircraft.team.team_id });
    console.log(account)

    account = banking.withdrawal(account, 1, `Deployment of ${aircraft.name}`)

    await account.save();
    await aircraft.save();
    console.log(`Aircraft ${aircraft.name} deployed...`);

    return;

  } catch (err) {
    modelDebugger('Error:', err.message);
  }
}

module.exports = { Interceptor, launch, validateInterceptor, getAircrafts }