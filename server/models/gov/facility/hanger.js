const mongoose = require('mongoose');
const { Facility } = require('./facility');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Hanger = Facility.discriminator('Hanger', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Hanger'}
}));

module.exports = { Hanger };