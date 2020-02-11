const mongoose = require('mongoose');
const modelDebugger = require('debug')('app: Military Model');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Army = Military.discriminator('Army', new Schema({
  type: { type: String, default: 'Army'},
  deploy: {
      local: 2,
      global: 5,
      attack: 2
  },
  stats: {
    health: { type: Number, default: 2 },
    healthMax: { type: Number, default: 2 },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 2 }
  }
}));

module.exports = { Army }