const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const InitRefSchema = new Schema({
  refType: { type: String, defualt: "Country", required: true },
  refName: { type: String, required: true },
  refCode: { type: String, required: true },
  refActive: { type: Boolean, default: false },
  refOther: { type: String, default: null }
  },
);

module.exports = InitRef = mongoose.model('initRef', InitRefSchema)