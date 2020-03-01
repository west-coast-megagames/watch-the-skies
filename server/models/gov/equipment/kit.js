const mongoose = require('mongoose');
const { Equipment } = require('./equipment');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Kit = Equipment.discriminator('Kit', new Schema({
    type: { type: String, default: 'Kit' },
    category: { type: String, enum: [ 'unknown' ]},
    stats: {
        sciRate: { type: Number },
        sciBonus: { type: Number },
        copacity: { type: Number }
    }
}));

module.exports = { Kit };