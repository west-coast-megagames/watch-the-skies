const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, minlength: 5, maxlength: 15 },
  name: {
    first: { type: String, required: true, minlength: 1, maxlength: 25 },
    last: { type: String, required: true, minlength: 1, maxlength: 50 }
  },
  email: { type: String, required: true, minlength: 5, maxlength: 255 },
  phone: { type: String, minlength: 10, maxlength: 14 },
  password: {type: String, required: true, minlength: 5, maxlength: 1024},
  address: {
    street1: { type: String },
    street2: { type: String },
    city: { type: String },
    state: { type: String, minlength: 2, maxlength: 2 },
    zipcode: { type: String, minlength: 5, maxlength: 10 }
  },
  dob: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Non-Binary"]},
  discord: { type: String },
  team: { 
    teamName: { type: String, minlength: 2, maxlength: 50, default: "UN-Assigned" },
    team_id: { type: Schema.Types.ObjectId, ref: 'Team'},
    teamCode: { type: String, minlength: 2, maxlength: 3 }
  }
});

UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));

  return token;
};    

let User = mongoose.model('user', UserSchema);

function validateUser(user) {
  const schema = {
    username: Joi.string().min(5).max(15).required(),
    email: Joi.string().min(5).max(255).required().email(),
    phone: Joi.string().min(10).max(14),
    password: Joi.string().min(5).max(1024).required(),
    gender: Joi.string(),
    discord: Joi.string(),
    name: Joi.object().keys({
      first: Joi.string().min(1).max(25),
      last: Joi.string().min(1).max(50), 
    }),    
    address: Joi.object().keys({
      street1: Joi.string().min(1).max(75),
      street2: Joi.string().empty(''),
      city: Joi.string().min(1).max(50),
      state: Joi.string().min(2).max(2),
      zipcode: Joi.string().min(5).max(10)
    })
  };

  return Joi.validate(user, schema, { "allowUnknown": true });
}

module.exports = { User, validateUser };