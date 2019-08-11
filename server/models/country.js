
const Joi = require('joi');

const mongoose = require('mongoose');

const Country = mongoose.model('Country', new mongoose.Schema({
    zone: { 
        type: new mongoose.Schema({
          name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 3,
            default: "UNA"           // unassigned
          },
          activeFlag: {
              type: Boolean,
              default: false
          }
        }),
        required: true
    },
    code: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 2,
        uppercase
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 255
    },
    activeFlag: {
        type: Boolean,
        default: false
    }
}));

function validateCountry(country) {
    const schema = {
      zoneId: Joi.objectId().required()
    };
  
    return Joi.validate(country, schema);
  }
  
  exports.Country = Country; 
  exports.validateCountry = validateCountry;