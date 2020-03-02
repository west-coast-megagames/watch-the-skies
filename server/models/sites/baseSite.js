const mongoose = require('mongoose');
const { Site } = require('./site');
const Schema = mongoose.Schema;
const Joi = require('joi');

const BaseSite = Site.discriminator('BaseSite', new Schema({
  type: { type: String, default: 'Base' },
  defenses: { type: Boolean, default: false },
  public: { type: Boolean, default: false }
}));

function validateBase(baseSite) {
  //modelDebugger(`Validating ${baseSite.baseName}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required(),
      siteCode: Joi.string().min(2).max(20).required()
    };
  
  return Joi.validate(baseSite, schema, { "allowUnknown": true });
};

module.exports = { BaseSite, validateBase }
