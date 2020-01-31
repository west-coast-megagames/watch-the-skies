const mongoose = require('mongoose');
const Site = require('./site');
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
  baseCode: { type: String, minlength: 2, maxlength: 50, default: "undefined"} ,
  baseDefenses: { type: Boolean, default: false },
  team: { type: Schema.Types.ObjectId, ref: 'Team'},
  facilities: [FacilitySchema]
}));

/* NOT WORKING
Site.methods.validateBase = function (baseSite) {
  const schema = {
    baseName: Joi.string().min(2).max(50).required()
  };

  return Joi.validate(baseSite, schema, { "allowUnknown": true });
}
*/

//let BaseSite = mongoose.model('baseSite', BaseSiteSchema);

function validateBase(baseSite) {
  //modelDebugger(`Validating ${baseSite.baseName}...`);

  const schema = {
      baseName: Joi.string().min(2).max(50).required(),
      baseCode: Joi.string().min(2).max(50)
    };
  
  return Joi.validate(baseSite, schema, { "allowUnknown": true });
};

module.exports = { BaseSite, validateBase }