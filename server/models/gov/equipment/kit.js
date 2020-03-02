const mongoose = require('mongoose');
const { Equipment } = require('./equipment');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Kit = Equipment.discriminator('Kit', new Schema({
    type: { type: String, default: 'Kit' },
    category: { type: String, enum: [ 'unknown' ]},
    sites: { type: String, default: 'Kit' }, 
    stats: {
        sciRate: { type: Number },
        sciBonus: { type: Number },
        capacity: { type: Number }
    }
}));

module.exports = { Kit };