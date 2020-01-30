const mongoose = require('mongoose');
const Site = require('./site');
const Schema = mongoose.Schema;
const Joi = require('joi');

const CitySite = Site.discriminator('CitySite', new Schema({
  siteType: { type: String, default: 'City' },
  cityName: { type: String, required: true, minlength: 2, maxlength: 50 },
  cityCode: { type: String, minlength: 2, maxlength: 50, default: "undefined"} ,
  team: { type: Schema.Types.ObjectId, ref: 'Team'}
}));

/* NOT WORKING
Site.methods.validateCity = function (citySite) {
  const schema = {
    cityName: Joi.string().min(2).max(50).required()
  };

  return Joi.validate(citySite, schema, { "allowUnknown": true });
}
*/

//let CitySite = mongoose.model('citySite', CitySiteSchema);

function validateCity(citySite) {
  //modelDebugger(`Validating ${citySite.cityName}...`);

  const schema = {
      cityName: Joi.string().min(2).max(50).required(),
      cityCode: Joi.string().min(2).max(50)
    };
  
  return Joi.validate(citySite, schema, { "allowUnknown": true });
};

module.exports = { CitySite, validateCity }
