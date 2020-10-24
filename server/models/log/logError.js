const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
const nexusError = require('../../middleware/util/throwError'); // Costom error handler util

const LogErrorSchema = new Schema({
	timestamp: { type: Date },
	level: { type: String },
	message: { type: String, minlength: 1 },
	meta: {
		message: { type: String },
		name: { type: String },
		stack: { type: String }
	}
});

// validate User method
LogErrorSchema.methods.validateLogError = async function () {
	const schema = Joi.object({
		message: Joi.string().min(1)
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

};

const LogError = mongoose.model('logError', LogErrorSchema);

module.exports = { LogError };
