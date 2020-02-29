const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:facilityModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const FacilitySchema = new Schema({
  model: { type: String, default: 'Facility'},
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  site: { type: Schema.Types.ObjectId, ref: 'Site' },
  equipment: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }],
  capacity: { type: Number },
  status: {
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    secret: { type: Boolean, default: false }
  },
  hidden: {type: Boolean, default: false }
});

let Facility = mongoose.model('Facility', FacilitySchema);

function validateFacility(facility) {

  const schema = {
    name: Joi.string().min(2).max(50).required()
  };
  
  return Joi.validate(facility, schema, { "allowUnknown": true });
}

module.exports = { Facility, validateFacility }