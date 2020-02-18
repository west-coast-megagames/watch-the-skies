const mongoose = require('mongoose');
const { Equipment } = require('./equipment');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Gear = Equipment.discriminator('Gear', new Schema({
    type: { type: String, default: 'Gear' },
    category: { type: String, enum: [ 'Weapons', 'Vehicles', 'Transport', "Training" ]},
    stats: {
        healthMax: { type: Number },
        attack: { type: Number },
        defense: { type: Number },
        localDeploy: { type: Number },
        globalDeploy: { type: Number },
        invasion: { type: Number }
    }
}));

module.exports = { Gear };