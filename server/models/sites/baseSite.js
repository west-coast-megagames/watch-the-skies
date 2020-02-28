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
  type: { type: String, default: 'Base' },
  defenses: { type: Boolean, default: false },
  facilities: [{ type: Schema.Types.ObjectId, ref: 'Facility' }],
  public: { type: Boolean, default: false }
}));

function validateBase(baseSite) {
  //modelDebugger(`Validating ${baseSite.baseName}...`);

  const schema = {
      name: Joi.string().min(2).max(50).required(),
      siteCode: Joi.string().min(2).max(20).required()
    };
  
  return Joi.validate(baseSite, schema, { "allowUnknown": true });
};

module.exports = { BaseSite, validateBase }
