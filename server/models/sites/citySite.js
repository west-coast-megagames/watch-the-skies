const mongoose = require('mongoose');
const { Site } = require('./site');
const Schema = mongoose.Schema;
const Joi = require('joi');

const CitySite = Site.discriminator('CitySite', new Schema({
  siteType: { type: String, default: 'City' },
  name: { type: String, required: true, minlength: 2, maxlength: 50 },
  dateline: { type: String, default : 'Dateline'},
  team: { type: Schema.Types.ObjectId, ref: 'Team'}
}));

function validateCity(citySite) {
  //modelDebugger(`Validating ${citySite.cityName}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required(),
      siteCode: Joi.string().min(2).max(20).required()
    };
  
  return Joi.validate(citySite, schema, { "allowUnknown": true });
};

module.exports = { CitySite, validateCity }
