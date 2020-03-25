const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:equipmentModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const EquipmentSchema = new Schema({
  model: { type: String, default: 'Equipment'},
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  unitType: { type: String },
  manufacturer: { type: Schema.Types.ObjectId, ref: 'Team'},
  cost: { type: Number },
  buildTime: { type: Number, default: 1 },
  buildCount: { type: Number, default: 0 },
  desc: { type: String },
  prereq: [{
    type: { type: String },
    code: {type: String },
  }],
  status: {
    building: { type: Boolean, default: true },
    salvage: { type: Boolean, default: false },
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false }
  }
});

let Equipment = mongoose.model('Equipment', EquipmentSchema);

EquipmentSchema.methods.validateEquipment = function (Equipment) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(Equipment, schema, { "allowUnknown": true });
}

function validateEquipment(Equipment) {

  const schema = {
      name: Joi.string().min(2).max(50).required(),
    };

  return Joi.validate(Equipment, schema, { "allowUnknown": true });
};

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

module.exports = { Equipment, validateEquipment, Gear }
