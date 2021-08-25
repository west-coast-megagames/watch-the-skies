const mongoose = require('mongoose'); // Mongo DB object modeling module

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema

// Intel Schema
const IntelSchema = new Schema({
	model: { type: String, default: 'Intel' },
	type: {
		type: String,
		min: 2,
		maxlength: 50,
		enum: ['account', 'aircraft', 'alliance', 'article', 'blueprint', 'country', 'facility', 'intel', 'military', 'report', 'research', 'site', 'squad', 'team', 'trade', 'treaty', 'upgrade', 'zone']
	},
	team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	document: { type: Schema.Types.Mixed },
	source: { type: Schema.Types.Mixed },
	update: { type: Schema.Types.Mixed }

});

const Intel = mongoose.model('Intel', IntelSchema);

module.exports = { Intel };