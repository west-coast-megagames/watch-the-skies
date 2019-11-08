const mongoose = require('mongoose');
const gameClock = require('../util/systems/gameClock/gameClock');
const Schema = mongoose.Schema;
const Joi = require('joi');

const RoleSchema = new Schema({
  role: { type: String },
  type: { type: String, enum: ['Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military']},
  userID: { type: String },  
});

const TeamSchema = new Schema({
  name: { type: String, required: true, unique: true },
  countryID: { type: String, required: true, minlength: 3, maxlength: 25 },
  roles: [RoleSchema],
  prTrack: [Number],
});

let Team = mongoose.model('team', TeamSchema);

module.exports = Team;