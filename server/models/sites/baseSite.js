const mongoose = require('mongoose');
const { Site } = require('./site');
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

const BaseSite = Site.discriminator('BaseSite', new Schema({
  siteType: { type: String, default: 'Base' },
  baseName: { type: String, required: true, minlength: 2, maxlength: 50 },
  /* should not have both a baseCode and siteCode 
  baseCode: { type: String, minlength: 2, maxlength: 50, default: "undefined"} ,
  */
  baseDefenses: { type: Boolean, default: false },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  facilities: {
    labs: { type: Number, default: 1 },
    Hangers: { type: Number, default: 1 },
    Factory: { type: Number, default: 1 }
  }
}));

function validateBase(baseSite) {
  //modelDebugger(`Validating ${baseSite.baseName}...`);

  const schema = {
      baseName: Joi.string().min(2).max(50).required(),
      siteCode: Joi.string().min(2).max(20).required()
    };
  
  return Joi.validate(baseSite, schema, { "allowUnknown": true });
};

module.exports = { BaseSite, validateBase }
