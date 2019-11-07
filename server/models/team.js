const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const FinancesSchema = new Schema({
  timestamp: { 
    date: { type: Date, default: Date.now() },
    quarter: { type: String, required: true },
    year: { type: Number, required: true },
    turnNum: { type: Number, required: true }
  },
  prScore: { type: Number, required: true },
  treasury: { type: Number },
  govAccount: {type: Number },
  opsAccount: { type: Number },
  sciAccount: { type: Number },
  dipAccount: { type: Number },
  unAccount: { type: Number }
});

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
  finances: [FinancesSchema],
});

let Team = mongoose.model('team', TeamSchema);

module.exports = Team;