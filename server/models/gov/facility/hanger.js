const mongoose = require('mongoose');
const { Facility } = require('./facility');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Hanger = Facility.discriminator('Hanger', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Hanger'},
  equipmnet: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }],
  project: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }]
}));

module.exports = { Hanger };