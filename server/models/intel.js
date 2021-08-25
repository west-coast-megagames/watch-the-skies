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
	team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	document: { type: Schema.Types.Mixed },
	source: { type: Schema.Types.Mixed },
	update: { type: Schema.Types.Mixed },
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
		modelKeys = ['location', 'site,', 'zone', 'country'];
		for (const prop in doc.status) {
			if (d6() + d6() > 8) {
				this.status[prop] = doc[prop];
				this.source.status[prop] = source;
				this.update.status[prop] = { date: Date.now(), timestamp: clock.getTimeStamp() };
			}
		}
		for (const prop in doc.stats) {
			if (d6() + d6() > 8) {
				this.stats[prop] = doc[prop];
				this.source.status[prop] = source;
				this.update.status[prop] = { date: Date.now(), timestamp: clock.getTimeStamp() };
			}
		}
		for (const prop in doc.systems) {
			if (d6() + d6() > 8) {
				this.stats[prop] = doc[prop];
				this.source.status[prop] = source;
				this.update.status[prop] = { date: Date.now(), timestamp: clock.getTimeStamp() };
			}
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

};

IntelSchema.methods.servaillanceIntel = async function () {
	console.log('Rawr');
};

IntelSchema.methods.espionageIntel = async function () {
	console.log('Rawr');
};

const Intel = mongoose.model('Intel', IntelSchema);

module.exports = { Intel };