const mongoose = require('mongoose');
const modelDebugger = require('debug')('app: Military Model');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Fleet = Military.discriminator('Fleet', new Schema({
  type: { type: String, default: 'Fleet'},
  deploy: {
      local: 2,
      global: 5,
      attack: 2
  },
  stats: {
    health: { type: Number, default: 4 },
    healthMax: { type: Number, default: 4 },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 2 }
  }
}));

module.exports = { Fleet }