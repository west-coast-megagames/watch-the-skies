const mongoose = require('mongoose');
const Site = require('./site');
const Schema = mongoose.Schema;
const Joi = require('joi');

const CrashSite = Site.discriminator('CrashSite', new Schema({
  siteType: { type: String, default: 'Crash' },
  crashName: { type: String, required: true, minlength: 2, maxlength: 50 },
  crashCode: { type: String, minlength: 2, maxlength: 50, default: "undefined"} ,
  team: { type: Schema.Types.ObjectId, ref: 'Team'}
}));

/* NOT WORKING
Site.methods.validateCrash = function (crashSite) {
  const schema = {
    crashName: Joi.string().min(2).max(50).required()
  };

  return Joi.validate(crashSite, schema, { "allowUnknown": true });
}
*/

//let CrashSite = mongoose.model('crashSite', CrashSiteSchema);

function validateCrash(crashSite) {
  //modelDebugger(`Validating ${crashSite.crashName}...`);

  const schema = {
      crashName: Joi.string().min(2).max(50).required(),
      crashCode: Joi.string().min(2).max(50)
    };
  
  return Joi.validate(crashSite, schema, { "allowUnknown": true });
};

module.exports = { CrashSite, validateCrash }
