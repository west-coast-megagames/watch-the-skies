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

const Lab = Facility.discriminator('Lab', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Lab'},
  sciRate: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  funding: { type: Number, default: 0 },
  research: [{ type: Schema.Types.ObjectId, ref: 'Research' }]
}));

const Hanger = Facility.discriminator('Hanger', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Hanger'}
}));

const Factory = Facility.discriminator('Factory', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Factory'},
  project: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }]
}));

const Crisis = Facility.discriminator('Crisis', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Crisis'}
}));

const Civilian = Facility.discriminator('Civilian', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Civilian'}
}));

module.exports = { Facility, validateFacility, Lab, Hanger, Factory, Crisis, Civilian }