const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const AllianceSchema = new Schema({
	model: { type: String, default: 'Alliance' },
	teams: [{ type: ObjectId, ref: 'Team' }],
	types: {
		science: { type: Boolean, default: false },
		military: { type: Boolean, default: false },
		logistics: { type: Boolean, default: false },
		aid: { type: Boolean, default: false }
	},
	status: {
		active: { type: Boolean, default: true }
	}
});

const Alliance = mongoose.model('Alliance', AllianceSchema);

module.exports = { Alliance };