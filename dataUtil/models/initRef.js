const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const InitRefSchema = new Schema({
  refType: { type: String, defualt: "Country", required: true },
  refName: { type: String, required: true },
  refCode: { type: String, required: true },
  refLoad: { type: Boolean, default: false },
  refParent1: { type: String, default: null },
  refParent2: { type: String, default: null },
  refNumber1: { type: Number },
  refBoolean1: { type: Boolean }
  }
);

module.exports = InitRef = mongoose.model('initRef', InitRefSchema)