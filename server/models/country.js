// 10/20/2019 removed zone (obsolete)  JWQC
//
const Joi = require('joi');

const mongoose = require('mongoose');

const Country = mongoose.model('Country', new mongoose.Schema({
    code: {
        type: String,
        required: true,
        //index: true,
        trim: true,
        //unique: true,
        minlength: 2,
        maxlength: 2
        //uppercase: true
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
    name: Joi.string().min(3).max(255).required(),
    code: Joi.string().min(2).max(2).required(),
    activeFlag: Joi.boolean()
  };

  return Joi.validate(country, schema);
}
  
  exports.Country = Country; 
  exports.validateCountry = validateCountry;