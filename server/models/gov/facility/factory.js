const mongoose = require('mongoose');
const { Facility } = require('./facility');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Factory = Facility.discriminator('Factory', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Factory'},
  equipment: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }],
  project: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }]
}));

module.exports = { Factory };