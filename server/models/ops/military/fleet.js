const mongoose = require('mongoose');
const modelDebugger = require('debug')('app: Military Model');
const Schema = mongoose.Schema;
const { Military } = require('./military');
const Joi = require('joi');

const Fleet = Military.discriminator('Fleet', new Schema({
  type: { type: String, default: 'Fleet'},
  stats: {
    health: { type: Number, default: 4 },
    healthMax: { type: Number, default: 4 },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 2 },
    localDeploy: { type: Number, default: 2 },
    globalDeploy: { type: Number, default: 5 },
    invasion: { type: Number, default: 2 },
  },
  gear: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }]
}));

module.exports = { Fleet }