const mongoose = require('mongoose');
const { Equipment } = require('./equipment');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Infrustructure = Equipment.discriminator('Infrustructure', new Schema({
    type: { type: String, default: 'Infrustructure' },
    category: { type: String, enum: [ 'unknown' ]},
    stats: {
        sciRate: { type: Number },
        multiplier: { type: Number },
        copacity: { type: Number }
    }
}));

module.exports = { Infrustructure };