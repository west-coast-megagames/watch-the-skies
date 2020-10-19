const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
const nexusError = require('../middleware/util/throwError');

const logInfoSchema = new Schema({
	timestamp: { type: Date },
	level: { type: String },
	message: { type: String, minlength: 1 },
	meta: {
		message: { type: String },
		name: { type: String },
		stack: { type: String }
	}
});

logInfoSchema.methods.validatelogInfo = async function () {
	const schema = Joi.object({
		message: Joi.string().min(1)
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

};

const LogInfo = mongoose.model('logInfo', logInfoSchema);

module.exports = { LogInfo };