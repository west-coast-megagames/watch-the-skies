const mongoose = require('mongoose');
const { Aircraft } = require('./aircraft');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Interceptor = Aircraft.discriminator('Interceptor', new Schema({
  type: { type: String, required: true, min: 2, maxlength: 50, default: 'Interceptor'},
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
  systems: [{ type: Schema.Types.ObjectId, ref: 'System' }]
}));

function validateInterceptor(interceptor) {
  //modelDebugger(`Validating ${interceptor.name}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required(),
      type: Joi.string().min(2).max(50).required()
    };
  
  return Joi.validate(interceptor, schema, { "allowUnknown": true });
};

module.exports = { Interceptor , validateInterceptor };