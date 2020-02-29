const mongoose = require('mongoose');
const gameClock = require('../../wts/gameClock/gameClock');
const modelDebugger = require('debug')('app:mediaModel');
const Schema = mongoose.Schema;
const Joi = require('joi');
const { Team } = require('./team');

const Media = Team.discriminator("Media", new Schema({
  type: { type: String, default: 'Media' },
  agents: { type: Number }
}));

function validateMedia(media) {
  //modelDebugger(`Validating ${media.name}...`);

  const schema = {
      teamCode: Joi.string().min(2).max(3).required().uppercase(),
      name: Joi.string().min(2).max(50).required(),
      shortName: Joi.string().min(2).max(30),
      teamType: Joi.string().min(1).max(1).uppercase()
    };
  
  return Joi.validate(media, schema, { "allowUnknown": true });
};

module.exports = { Media, validateMedia }