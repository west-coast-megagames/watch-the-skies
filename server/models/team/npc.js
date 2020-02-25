const mongoose = require('mongoose');
const gameClock = require('../../wts/gameClock/gameClock');
const modelDebugger = require('debug')('app:npcModel');
const Schema = mongoose.Schema;
const Joi = require('joi');
const { Team } = require('./team');

const Npc = Team.discriminator("Npc", new Schema({
  type: { type: String, default: 'Npc' },
  sciRate: { type: Number, default: 25 }
}));

function validateNpc(npc) {
  //modelDebugger(`Validating ${npc.name}...`);

  const schema = {
      teamCode: Joi.string().min(2).max(3).required().uppercase(),
      name: Joi.string().min(2).max(50).required(),
      shortName: Joi.string().min(2).max(30),
      teamType: Joi.string().min(1).max(1).uppercase()
    };
  
  return Joi.validate(npc, schema, { "allowUnknown": true });
};

module.exports = { Npc, validateNpc }