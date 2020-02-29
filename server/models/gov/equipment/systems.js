const mongoose = require('mongoose');
const { Equipment } = require('./equipment');
const Schema = mongoose.Schema;
const Joi = require('joi');

const System = Equipment.discriminator('System', new Schema({
    type: { type: String, default: 'System' },
    category: { type: String, enum: [ 'Weapon', 'Engine', 'Sensor', 'Compartment', 'Util' ] },
    stats: {
        hullMax: { type: Number },
        attack: { type: Number },
        penetration: { type: Number },
        armor: { type: Number },
        shield: { type: Number },
        evade: { type: Number },
        range: { type: Number },
        cargo: { type: Number }
    }
}));

module.exports = { System };