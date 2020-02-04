const mongoose = require('mongoose');
const { Site } = require('./site');
const Schema = mongoose.Schema;
const Joi = require('joi');

const CrashSite = Site.discriminator('CrashSite', new Schema({
  siteType: { type: String, default: 'Crash' },
  crashName: { type: String, required: true, minlength: 2, maxlength: 50 },
  /* should not have both crashCode and siteCode
  crashCode: { type: String, minlength: 2, maxlength: 50, default: "undefined"} ,
  */
  team: { type: Schema.Types.ObjectId, ref: 'Team'}
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
