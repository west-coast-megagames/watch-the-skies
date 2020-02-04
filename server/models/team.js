const mongoose = require('mongoose');
const gameClock = require('../wts/gameClock/gameClock');
const modelDebugger = require('debug')('app:teamModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const RoleSchema = new Schema({
  role: { type: String },
  type: { type: String, enum: ['Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military']},
  user: { type: Schema.Types.ObjectId, ref: 'User'} 
});

//teamType is (N)ational, (A)lien or (M)edia
const TeamSchema = new Schema({
  name: { type: String, required: true, unique: true, minlength: 2, maxlength: 50 },
  shortName: { type: String, minlength: 2, maxlength: 30 },
  teamCode: { type: String, required: true, unique: true, minlength: 2, maxlength: 3 },
  teamType: { type: String, required: true, minlength: 1, maxlength: 1, default: 'N', enum: ['N', 'A', 'M'] },
  roles: [RoleSchema],
  prTrack: [Number],
  prLevel: { type: Number },
  sciRate: { type: Number, default: 25 }
});

TeamSchema.methods.validateTeam = function (team) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    shortName: Joi.string().min(2).max(30),
    teamCode: Joi.string().min(2).max(3).required().uppercase(),
    teamType: Joi.string().min(1).max(1).uppercase()
  };

  return Joi.validate(team, schema, { "allowUnknown": true });
}

let Team = mongoose.model('Team', TeamSchema);

function validateTeam(team) {
  //modelDebugger(`Validating ${team.name}...`);

  const schema = {
      teamCode: Joi.string().min(2).max(3).required().uppercase(),
      name: Joi.string().min(2).max(50).required(),
      shortName: Joi.string().min(2).max(30),
      teamType: Joi.string().min(1).max(1).uppercase()
    };
  
  return Joi.validate(team, schema, { "allowUnknown": true });
};

async function getPR(team_id) {
  modelDebugger(`Trying to find PR for ${team_id}`)
  try {
    let prLevel = await Team.findOne({ _id: team_id }).select('prLevel');
    return prLevel.prLevel;
  } catch (err) {
    modelDebugger(`Error: ${err.message}`);
  }
};

async function getSciRate(team_id) {
  modelDebugger(`Trying to find SCI Rate for ${team_id}`)
  try {
    let sciRate = await Team.findOne({ _id: team_id }).select('sciRate');
    return sciRate.sciRate;
  } catch (err) {
    modelDebugger(`Error: ${err.message}`);
  }
};

async function getTeam(team_id) {
  let team = await Team.findOne({ _id: team_id });
  return team;
};

module.exports = { Team, validateTeam, getPR, getTeam, getSciRate }