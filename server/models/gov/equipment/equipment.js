const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:equipmentModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const EquipmentSchema = new Schema({
  model: { type: String, default: 'Equipment'},
  name: { type: String, required: true, min: 2, maxlength: 50 },
  owner: { type: Schema.Types.ObjectId, ref: 'Team'},
  manufacturer: { type: Schema.Types.ObjectId, ref: 'Team'},
  cost: { type: Number },
  buildTime: { type: Number },
  desc: { type: String },
  prereq: [{
    type: { type: String },
    name: {type: String },
  }],
  status: {
    salvage: { type: Boolean, default: false },
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
  }
});

let Equipment = mongoose.model('Equipment', EquipmentSchema);

module.exports = { Equipment }