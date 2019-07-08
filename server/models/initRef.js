const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const InitRefSchema = new Schema({
  refType: { type: String, defualt: "Country", required: true },
  refName: {String, required: true,
  refCode: {String, required: true},
  refActive: {Boolean}
  },
});

module.exports = InitRef = mongoose.model('initRef', InitRefSchema)