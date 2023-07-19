const mongoose = require('mongoose'); // Mongo DB object modeling module
const nexusEvent = require('../middleware/events/events');
const { logger } = require('../middleware/log/winston'); // Loging midddleware

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema

// Intel Schema
const IntelSchema = new Schema({
	model: { type: String, default: 'Intel' },
	type: {
		type: String,
		min: 2,
		maxlength: 50,
		enum: ['account', 'aircraft', 'alliance', 'article', 'blueprint', 'organization', 'facility', 'intel', 'military', 'report', 'research', 'site', 'squad', 'team', 'trade', 'treaty', 'upgrade', 'zone']
	},
	subject: { type: String },
	team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	document: { type: Schema.Types.Mixed, default: {} },
	source: { type: Schema.Types.Mixed, default: {} },
	tags: [{ type: String, enum: [''] } ],
}, { timestamps: true });

const Intel = mongoose.model('Intel', IntelSchema);

module.exports = { Intel };