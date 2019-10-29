const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const UserSchema = new Schema({
  screenname: { type: String, required: true, unique: true, minlength: 5, maxlength: 15 },
  name: {
    first: { type: String, required: true, minlength: 3, maxlength: 25 },
    last: { type: String, required: true, minlength: 3, maxlength: 50 }
  },
  email: { type: String, required: true, minlength: 5, maxlength: 255 },
  password: {type: String, required: true, minlength: 5, maxlength: 1024},
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Non-Binary"]},
});

let User = mongoose.model('user', UserSchema);

function validateUser(user) {
  const schema = {
    screenname: Joi.string().min(5).max(15).required(),
    name: {
      first: Joi.string().min(3).max(25).required(),
      last: Joi.string().min(3).max(50).required(), 
    },
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
    age: Joi.number().integer().min(14).max(99).required(), 
    gender: Joi.string()
  };

  return Joi.validate(user, schema);
}

module.exports = { User, validateUser };