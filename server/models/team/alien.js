const mongoose = require('mongoose');
const gameClock = require('../../wts/gameClock/gameClock');
const modelDebugger = require('debug')('app:alienModel');
const Schema = mongoose.Schema;
const Joi = require('joi');
const { Team, RoleSchema } = require('./team');

const Alien = Team.discriminator("Alien", new Schema({
  type: { type: String, default: 'Alien' },
  roles: [RoleSchema],
  actionPts: { type: Number, default: 25 },
  agents: { type: Number, min: 0, default: 0 },
  sciRate: { type: Number, default: 25 }
}));

function validateAlien(alien) {
  //modelDebugger(`Validating ${alien.name}...`);

  const schema = {
      teamCode: Joi.string().min(2).max(3).required().uppercase(),
      name: Joi.string().min(2).max(50).required(),
      shortName: Joi.string().min(2).max(30),
      teamType: Joi.string().min(1).max(1).uppercase()
    };
  
  return Joi.validate(alien, schema, { "allowUnknown": true });
};

module.exports = { Alien, validateAlien }