// 10/20/2019 removed zone (obsolete)  JWQC
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const CountrySchema = new Schema({
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
        maxlength: 255
    },
    activeFlag: {
        type: Boolean,
        default: false
    }
});


CountrySchema.methods.validateCountry = function (country) {
  const schema = {
    name: Joi.string().min(3).max(255).required(),
    code: Joi.string().min(2).max(2).required(),
    activeFlag: Joi.boolean()
  };

  return Joi.validate(country, schema);
}
  
module.exports = Country = mongoose.model('country', CountrySchema);