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
});

const TeamSchema = new Schema({
  name: { type: String, required: true, unique: true },
  countryID: { type: String, required: true, minlength: 3, maxlength: 25 },
  roles: [RoleSchema],
  prTrack: [Number],
  prLevel: { type: Number, required: true },
  accounts: [AccountSchema]
});

let Team = mongoose.model('team', TeamSchema);

function validateTeam(team) {
  modelDebugger(`Validating ${team.name}...`);
  return null;
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

module.exports = { Team, validateTeam, getPR, getAccounts, getTeam };
