const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
const countryDebugger = require('debug')('app:country');

// type are Terrestrial(earth) and Alien
const CountrySchema = new Schema({
  model: { type: String, default: 'Country'},
  type: {  type: String, minlength: 1, maxlength: 1, enum: ["T", "A"], default: "T"} ,
  zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
  loadZoneCode: {type: String, maxlength: 2, uppercase: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  loadTeamCode: { type: String, maxlength: 3 },
  code: {
      type: String,
      required: true,
      index: true,
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 2,
      uppercase: true
  },
  name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 75
  },
  unrest: {
      type: Number,
      min: 0,
      max: 250,
      default: 0
  },
  coastal: {
    type: Boolean,
    default: false
  },
  borderedBy: [{type: Schema.Types.ObjectId, ref: 'Country'}]
});

CountrySchema.methods.validateCountry = function (country) {
  const schema = {
    name: Joi.string().min(3).max(75).required(),
    code: Joi.string().min(2).max(2).required().uppercase(),
    unrest: Joi.number().min(0).max(250)
  };

  return Joi.validate(country, schema, { "allowUnknown": true });
}

let Country = mongoose.model('Country', CountrySchema);

function validateCountry(country) {

  const schema = {
    code: Joi.string().min(2).max(2).required().uppercase(),
    name: Joi.string().min(3).max(75).required(),
    unrest: Joi.number().min(0).max(250)
  };
  
  return Joi.validate(country, schema, { "allowUnknown": true });
}

module.exports = { Country, validateCountry };