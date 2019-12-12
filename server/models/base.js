const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:baseModel');
const Schema = mongoose.Schema;
const Joi = require('joi');

const BaySchema = new Schema({
  inUse: { type: Boolean, default: false },
  unitID: { type: String, minlength: 2, maxlength: 30, default: "undefined" }
});

const FacilitySchema = new Schema({
  type: { type: String, enum: ['engineeringBay', 'constructionBay', 'lab', 'hangar'] },
  name: { type: String, minlength: 2, maxlength: 30},
  bays: [BaySchema]
});

const BaseSchema = new Schema({
  baseName: { type: String, required: true, minlength: 2, maxlength: 50 },
  baseCode: { type: String, minlength: 2, maxlength: 50, default: "undefined"} ,
  baseDefenses: { type: Boolean, default: false },
  team: { 
    teamName: { type: String, minlength: 2, maxlength: 50, default: "UN-Assigned" },
    team_id: { type: Schema.Types.ObjectId, ref: 'Team'}
  },
  country: { 
    countryName: { type: String, default: "UN-Assigned" },
    country_id: { type: Schema.Types.ObjectId, ref: 'Country'}
  },
  facilities: [FacilitySchema]

});

BaseSchema.methods.validateBase = function (base) {
  const schema = {
    baseName: Joi.string().min(2).max(50).required()
  };

  return Joi.validate(base, schema, { "allowUnknown": true });
}

let Base = mongoose.model('base', BaseSchema);

function validateBase(base) {
  //modelDebugger(`Validating ${base.baseName}...`);

  const schema = {
      baseName: Joi.string().min(2).max(50).required()
    };
  
  return Joi.validate(base, schema, { "allowUnknown": true });
};

module.exports = { Base, validateBase }