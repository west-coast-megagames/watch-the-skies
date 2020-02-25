const mongoose = require('mongoose');
const gameClock = require('../../wts/gameClock/gameClock');
const modelDebugger = require('debug')('app:controlModel');
const Schema = mongoose.Schema;
const Joi = require('joi');
const { Team, RoleSchema } = require('./team');

const Control = Team.discriminator("Control", new Schema({
  type: { type: String, default: 'Control' },
  roles: [RoleSchema]
}));

function validateControl(control) {
  //modelDebugger(`Validating ${control.name}...`);

  const schema = {
      teamCode: Joi.string().min(2).max(3).required().uppercase(),
      name: Joi.string().min(2).max(50).required(),
      shortName: Joi.string().min(2).max(30),
      teamType: Joi.string().min(1).max(1).uppercase()
    };
  
  return Joi.validate(control, schema, { "allowUnknown": true });
};

module.exports = { Control, validateControl }