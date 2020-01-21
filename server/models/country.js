const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
const countryDebugger = require('debug')('app:country');

/*
 zone: { 
        zoneName: { type: String, minlength: 3, maxlength: 50, default: "UN-Assigned" },
        zone_id: { type: Schema.Types.ObjectId, ref: 'Zone'},
        zoneCode: {type: String, minlength: 2, maxlength: 2, uppercase: true }
    },
team: { 
      teamName: { type: String, minlength: 2, maxlength: 50, default: "UN-Assigned" },
      team_id: { type: Schema.Types.ObjectId, ref: 'Team'},
      teamCode: { type: String, minlength: 2, maxlength: 3 }
    },
*/

const CountrySchema = new Schema({ 
    zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
    loadZoneCode: {type: String, minlength: 2, maxlength: 2, uppercase: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team'},
    loadTeamCode: { type: String, minlength: 2, maxlength: 3 },
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
    }
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