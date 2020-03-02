const mongoose = require('mongoose');
const { Site } = require('./site');
const Schema = mongoose.Schema;
const Joi = require('joi');

const CrashSite = Site.discriminator('Crash', new Schema({
  type: { type: String, default: 'Crash' },
  salvage: [{ type: Schema.Types.ObjectId, ref: 'System'}],
  status: {
    public: { type: Boolean, default: false },
    secret: { type: Boolean, default: false }
  }

}));

function validateCrash(crashSite) {
  //modelDebugger(`Validating ${crashSite.crashName}...`);

  const schema = {
      crashName: Joi.string().min(2).max(50).required(),
      siteCode: Joi.string().min(2).max(20).required()
    };
  
  return Joi.validate(crashSite, schema, { "allowUnknown": true });
};

module.exports = { CrashSite, validateCrash }
