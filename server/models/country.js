
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
const countryDebugger = require('debug')('app:country');

const CountrySchema = new Schema({ 
    zone: { 
        zoneName: { type: String, required: true, minlength: 3, maxlength: 50, default: "UN-Assigned" },
        zoneId: { type: Schema.Types.ObjectId, ref: 'Zone'}
    },
    team: { 
      teamName: { type: String, required: true, minlength: 2, maxlength: 50, default: "UN-Assigned" },
      teamId: { type: Schema.Types.ObjectId, ref: 'Team'}
    },
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
    }
});

CountrySchema.methods.validateCountry = function (country) {
  const schema = {
    name: Joi.string().min(3).max(75).required(),
    code: Joi.string().min(2).max(2).required().uppercase()
  };

  return Joi.validate(country, schema, { "allowUnknown": true });
}

let Country = mongoose.model('country', CountrySchema);

function validateCountry(country) {
  const schema = {
    code: Joi.string().min(2).max(2).required().uppercase(),
    name: Joi.string().min(3).max(75).required()
  };

  return Joi.validate(country, schema, { "allowUnknown": true });
}

module.exports = { Country, validateCountry };