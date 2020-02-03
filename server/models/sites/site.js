const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const SiteSchema = new Schema({
    country: { type: Schema.Types.ObjectId, ref: 'Country'},
    siteCode: { type: String, minlength: 2, maxlength: 20, required: true },
    latDMS: { type: String, minlength: 7, maxlength: 12 },     // format DD MM SS.S N or S  example  40 44 55.0 N
    longDMS: { type: String, minlength: 7, maxlength: 13 },     // format DDD MM SS.S E or W example 073 59 11.0 W
    latDecimal: { type: Number, min: -90, max: 90 },           // Positive is North, Negative is South
    longDecimal: { type: Number, min: -180, max: 180 }         // Postive is East, Negative is West 
});

let Site = mongoose.model('Site', SiteSchema);

SiteSchema.methods.validateBase = function (baseSite) {
  const schema = {
    baseName: Joi.string().min(2).max(50).required(),
    siteCode: Joi.string().min(2).max(20).required()
  };

  return Joi.validate(baseSite, schema, { "allowUnknown": true });
}

module.exports = { Site };