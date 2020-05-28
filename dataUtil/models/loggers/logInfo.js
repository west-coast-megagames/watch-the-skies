const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const logInfoSchema = new Schema({
  timestamp: { type: Date},
  level: {type: String},
  message: {type: String},
  meta: {
    message: {type: String},
    name: {type: String},
    stack: {type: String}
  }
  });

let LogInfo = mongoose.model('logInfo', logInfoSchema);

function validatelogInfo(logError) {
  const schema = {
    message: Joi.string().min(1)
  };

  return Joi.validate(logError, schema);
}

module.exports = { LogInfo, validatelogInfo };