const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:facilityModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const FacilitySchema = new Schema({
  model: { type: String, default: 'Facility'},
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  site: { type: Schema.Types.ObjectId, ref: 'Site' },
  capacity: { type: Number },
  status: {
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
  }
});

let Facility = mongoose.model('Facility', FacilitySchema);

module.exports = { Facility }