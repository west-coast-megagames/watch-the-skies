const mongoose = require('mongoose');
const { Aircraft } = require('./aircraft');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Interceptor = Aircraft.discriminator('Interceptor', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Interceptor'},
  stats: {
    hull: { type: Number, default: 3 },
    hullMax: { type: Number, default: 3 },
    attack: { type: Number, default: 0 },
    penetration: { type: Number, default: 0 },
    armor: { type: Number, default: 0 },
    shield: { type: Number, default: 0 },
    evade: { type: Number, default: 0 },
    range: { type: Number, default: 0 },
    cargo: { type: Number, default: 0 },
    passiveRolls: [Number],
    activeRolls: [Number]
  },
  loadout: {
    cpu: { type: Number, default: 1 },
    weapons: { type: Number, default: 1 },
    engines: { type: Number, default: 1 },
    sensors: { type: Number, default: 1 },
    compartments: { type: Number, default: 1 },
    utils: { type: Number, default: 1 },
  },
  systems: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }]
}));

function validateInterceptor(interceptor) {
  //modelDebugger(`Validating ${interceptor.name}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required(),
      type: Joi.string().min(2).max(50)
    };
  
  return Joi.validate(interceptor, schema, { "allowUnknown": true });
};

module.exports = { Interceptor , validateInterceptor };