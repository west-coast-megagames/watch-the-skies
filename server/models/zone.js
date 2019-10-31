
const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ZoneSchema = new Schema({
  zoneCode: {type: String, 
             required: true,
             minlength: 3,
             maxlength: 3,
             uppercase: true,
             index: true,
             unique: true
            },
  zoneName: {type: String, 
             required: true,
             minlength: 3,
             maxlength: 50},
  zoneActive: { type: Boolean, default: true }
});

ZoneSchema.methods.validateZone = function (zone) {
  const schema = {
    zoneName: Joi.string().min(3).max(50).required(),
    zoneCode: Joi.string().min(3).max(3).required().uppercase(),
    zoneActive: Joi.boolean().default(true)
  };

  return Joi.validate(zone, schema);
}

let Zone = mongoose.model('zone', ZoneSchema);

function validateZone(zone) {
  const schema = {
    zoneCode: Joi.string().min(3).max(3).required().uppercase(),
    zoneName: Joi.string().min(3).max(50).required(),
    zoneActive: Joi.boolean().default(true)
  };

  return Joi.validate(zone, schema);
}

module.exports = { Zone, validateZone };