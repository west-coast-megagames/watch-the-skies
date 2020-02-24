const mongoose = require('mongoose');
const { Facility } = require('./facility');
const Schema = mongoose.Schema;
const Joi = require('joi');

const MilitaryBase = Facility.discriminator('MilitaryBase', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'MilitaryBase'},
  equipment: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }],
  project: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }]
}));

module.exports = { MilitaryBase };