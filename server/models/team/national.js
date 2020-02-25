const mongoose = require('mongoose');
const gameClock = require('../../wts/gameClock/gameClock');
const modelDebugger = require('debug')('app:nationalModel');
const Schema = mongoose.Schema;
const Joi = require('joi');
const { Team, RoleSchema } = require('./team');

const National = Team.discriminator("National", new Schema({
  type: { type: String, default: 'National' },
  roles: [RoleSchema],
  prTrack: [Number],
  agents: { type: Number, min: 0, default: 0 },
  prLevel: { type: Number },
  sciRate: { type: Number, default: 25 }
}));

function validateNational(national) {
  //modelDebugger(`Validating ${national.name}...`);

  const schema = {
      teamCode: Joi.string().min(2).max(3).required().uppercase(),
      name: Joi.string().min(2).max(50).required(),
      shortName: Joi.string().min(2).max(30),
      teamType: Joi.string().min(1).max(1).uppercase()
    };
  
  return Joi.validate(national, schema, { "allowUnknown": true });
};

module.exports = { National, validateNational }