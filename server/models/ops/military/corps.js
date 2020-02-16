const mongoose = require('mongoose');
const modelDebugger = require('debug')('app: Military Model');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Corps = Military.discriminator('Corps', new Schema({
  type: { type: String, default: 'Corps'},
  stats: {
    health: { type: Number, default: 2 },
    healthMax: { type: Number, default: 2 },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 2 },
    localDeploy: { type: Number, default: 2 },
    globalDeploy: { type: Number, default: 5 },
    invasion: { type: Number, default: 2 },
  }
}));

module.exports = { Army }