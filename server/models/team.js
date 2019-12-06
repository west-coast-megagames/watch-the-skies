const mongoose = require('mongoose');
const gameClock = require('../util/systems/gameClock/gameClock');
const modelDebugger = require('debug')('app:teamModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const RoleSchema = new Schema({
  role: { type: String },
  type: { type: String, enum: ['Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military']},
  userID: { type: String },  
});

const AccountSchema = new Schema({
  name: { type: String },
  code: { type: String },
  balance: { type: Number },
  deposits: [Number],
  withdrawls: [Number]
});

const TeamSchema = new Schema({
  name: { type: String, required: true, unique: true, minlength: 2, maxlength: 50 },
  shortName: { type: String, unique: true, minlength: 2, maxlength: 30 },
  teamCode: { type: String, required: true, unique: true, minlength: 2, maxlength: 3 },
  countryID: { type: String, minlength: 2, maxlength: 50 },
  roles: [RoleSchema],
  prTrack: [Number],
  prLevel: { type: Number },
  accounts: [AccountSchema]
});

TeamSchema.methods.validateTeam = function (team) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    shortName: Joi.string().min(2).max(30),
    teamCode: Joi.string().min(2).max(3).required().uppercase()
  };

  return Joi.validate(team, schema, { "allowUnknown": true });
}

let Team = mongoose.model('team', TeamSchema);

function validateTeam(team) {
  modelDebugger(`Validating ${team.name}...`);

  const schema = {
      teamCode: Joi.string().min(2).max(3).required().uppercase(),
      name: Joi.string().min(2).max(50).required(),
      shortName: Joi.string().min(2).max(30)
    };
  
  return Joi.validate(team, schema, { "allowUnknown": true });
};

async function getPR(teamID) {
  modelDebugger(`Trying to find PR for ${teamID}`)
  try {
    let prLevel = await Team.findOne({ _id: teamID }).select('prLevel');
    return prLevel.prLevel;
  } catch (err) {
    modelDebugger(`Error: ${err.message}`);
  }
};

async function getAccounts(teamID) {
  modelDebugger(`Trying to find accounts for ${teamID}`)
  try {
    let accounts = await Team.findOne({ _id: teamID }).select('accounts');
    return accounts.accounts;
  } catch (err) {
    modelDebugger(`Error: ${err.message}`);
  }
};

async function getTeam(teamID) {
  let team = await Team.findOne({ _id: teamID });
  return team;
};

module.exports = { Team, validateTeam, getPR, getAccounts, getTeam }
