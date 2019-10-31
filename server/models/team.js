const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const TeamSchema = new Schema({
  name: { type: String, required: true, unique: true},
  countryID: { type: String, required: true, minlength: 3, maxlength: 25 },
  roles: [RoleSchema],
  finances: [FinancesSchema]
});

let Team = mongoose.model('team', TeamSchema);

function validateTeam(team) {
  // const schema = {
  //   screenname: Joi.string().min(5).max(15).required(),
  //   name: {
  //     first: Joi.string().min(3).max(25).required(),
  //     last: Joi.string().min(3).max(50).required(), 
  //   },
  //   email: Joi.string().min(5).max(255).required().email(),
  //   password: Joi.string().min(5).max(1024).required(),
  //   address: {
  //     street1: Joi.string(),
  //     street2: Joi.string(),
  //     city: Joi.string(),
  //     state: Joi.string().min(2).max(2),
  //     zipcode: Joi.string().min(5).max(5)
  //   },
  //   DoB: Joi.Date().required(), 
  //   gender: Joi.string()
  // };

  return Joi.validate(team, schema);
}

module.exports = { Team, validateTeam };