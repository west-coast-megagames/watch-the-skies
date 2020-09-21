const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const LogErrorSchema = new Schema({
	timestamp: { type: Date },
	level: { type: String },
	message: { type: String },
	meta: {
		message: { type: String },
		name: { type: String },
		stack: { type: String }
	}
});

const LogError = mongoose.model('logError', LogErrorSchema);

function validateLogError (logError) {
	const schema = {
		message: Joi.string().min(1)
	};

	return Joi.validate(logError, schema);
}

module.exports = { LogError, validateLogError };