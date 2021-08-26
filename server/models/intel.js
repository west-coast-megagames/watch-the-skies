const mongoose = require('mongoose'); // Mongo DB object modeling module
const clock = require('../wts/gameClock/gameClock');
const { d6 } = require('../util/systems/dice');

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
	subject: { type: String },
	team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	document: { type: Schema.Types.Mixed, default: {} },
	source: { type: Schema.Types.Mixed, default: {} },
	update: { type: Schema.Types.Mixed, default: {} },
	lastUpdate: { type: Date, default: Date.now() },
	dateCreated: { type: Date, default: Date.now() }
});

IntelSchema.methods.reconIntel = async function (doc, source) {
	this.lastUpdate = Date.now();
	const commonKeys = ['_id', 'model', 'team'];
	let modelKeys = [];
	const randKeys = [];

	switch (doc.model) {
	case 'Aircraft':
		this.type = doc.model.toLowerCase();
		modelKeys = ['location', 'site,', 'zone', 'country'];

		this.document.status = {};
		this.source.status = {};
		this.update.status = {};
		for (const prop in doc.status) {
			// Possible spot for partial information on status --
			this.document.status[prop] = doc.status[prop];
			this.source.status[prop] = source;
			this.update.status[prop] = { date: Date.now(), timestamp: clock.getTimeStamp() };
		}
		this.document.stats = {};
		this.source.stats = {};
		this.update.stats = {};
		for (const prop in doc.stats) {
			// Possible spot for partial information on stats --
			this.document.stats[prop] = doc.stats[prop];
			this.source.stats[prop] = source;
			this.update.stats[prop] = { date: Date.now(), timestamp: clock.getTimeStamp() };
		}
		this.document.systems = {};
		this.source.systems = {};
		this.update.systems = {};
		for (const prop in doc.systems) {
			// Possible spot for partial information on systems
			this.document.systems[prop] = doc.systems[prop];
			this.source.systems[prop] = source;
			this.update.systems[prop] = { date: Date.now(), timestamp: clock.getTimeStamp() };
		}
		break;
	case 'Military':
		console.log('This is a military unit!');
		break;
	case 'Facility':
		console.log('This is a Facility!');
		break;
	case 'Squad':
		console.log('This is a squad!');
		break;
	case 'Site':
		console.log('This is a site');
		break;
	default:
		throw Error(`You can't get Recon Intel for a ${doc.model}`);
	}

	for (const key of [...commonKeys, ...modelKeys, ...randKeys]) {
		this.document[key] = doc[key];
		this.source[key] = source;
		this.update[key] = { date: Date.now(), timestamp: clock.getTimeStamp() };
	}

	return await this.save();

};

IntelSchema.methods.servaillanceIntel = async function () {
	console.log('Rawr');
};

IntelSchema.methods.espionageIntel = async function () {
	console.log('Rawr');
};

const Intel = mongoose.model('Intel', IntelSchema);

module.exports = { Intel };