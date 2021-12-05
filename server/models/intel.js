const mongoose = require('mongoose'); // Mongo DB object modeling module
const nexusEvent = require('../middleware/events/events');
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const { randCode } = require('../util/systems/codes');
const clock = require('../wts/gameClock/gameClock');
const { Facility } = require('./facility');

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
	lastUpdate: { type: Date, default: Date.now() },
	dateCreated: { type: Date, default: Date.now() },
	tags: [{ type: String, enum: [''] } ]
});

IntelSchema.methods.reconIntel = async function (doc, source = undefined) {
	this.lastUpdate = Date.now();
	this.type = doc.model.toLowerCase();
	if (!this.document.name) this.document.name = randCode(6);
	const commonKeys = ['_id', 'model', 'team', '__t', 'tags', 'status'];
	let modelKeys = [];
	let randKeys = [];

	// If the subject document has status, collect status
	if (doc.status) {
		this.document.status = {};
		this.source.status = {};

		for (const prop in doc.status) {
			// Possible spot for partial information on status --
			this.document.status[prop] = doc.status[prop];
			if (source) this.source.status[prop] = source;
		}
	}

	if (doc.stats) {
		this.document.stats = {};
		this.source.stats = {};
		for (const prop in doc.stats) {
			// Possible spot for partial information on stats --
			this.document.stats[prop] = doc.stats[prop];
			if (source) this.source.stats[prop] = source;
		}
	}

	switch (doc.model) {
	case 'Aircraft':
		modelKeys = ['location', 'site,', 'zone', 'organization', 'stance'];

		this.document.systems = {};
		this.source.systems = {};
		for (const prop in doc.systems) {
			// Possible spot for partial information on systems
			this.document.systems[prop] = doc.systems[prop];
			if (source) this.source.systems[prop] = { source, timestamp: clock.getTimeStamp() };
		}
		break;
	case 'Military':
		modelKeys = ['site,', 'origin', 'zone', 'organization'];
		break;
	case 'Facility':
		modelKeys = ['name', 'buildings', 'capabilities'];
		console.log('Currently making facility intel');
		break;
	case 'Squad':
		modelKeys = ['location', 'site', 'origin', 'zone', 'organization'];
		break;
	case 'Site':
		modelKeys = ['name', 'zone', 'geoDMS', 'geoDecimal', 'unrest', 'loyalty', 'repression', 'morale', 'subType'];

		try {
			const facilities  = await Facility.find()
				.where('site').equals(`${doc._id}`)
			for (const facility of facilities) {
				await facility.populateMe();
				let intel = await generateIntel(doc.team, facility._id);
				await intel.reconIntel(facility.toObject(), source)
			}
		}
		catch(err) {
			console.log(err);
		}

		break;
	default:
		throw Error(`You can't get Recon Intel for a ${doc.model}`);
	}

	for (const key of [...commonKeys, ...modelKeys, ...randKeys]) {
		this.document[key] = doc[key];
		this.source[key] = { source, timestamp: clock.getTimeStamp() };
	}
	this.markModified('document');
	this.markModified('source');

	let intel = await this.save()

	nexusEvent.emit('personal', [intel])

	return intel;
};

IntelSchema.methods.surveillanceIntel = async function (doc, source = undefined) {
	logger.info(`Generating Surveillance...`);
	this.type = doc.model.toLowerCase();
	if (!this.document.name) this.document.name = randCode(6);
	const commonKeys = ['_id', 'model', 'team', '__t', 'tags', 'status'];
	let modelKeys = [];
	const randKeys = [];

	// If the subject document has status, collect status
	if (doc.status) {
		this.document.status = {};
		this.source.status = {};

		for (const prop in doc.status) {
			// Possible spot for partial information on status --
			this.document.status[prop] = doc.status[prop];
			if (source) this.source.status[prop] = source;
		}
	}

	if (doc.stats) {
		this.document.stats = {};
		this.source.stats = {};
		for (const prop in doc.stats) {
			// Possible spot for partial information on stats --
			this.document.stats[prop] = doc.stats[prop];
			if (source) this.source.stats[prop] = source;
		}
	}

	switch (doc.model) {
	case 'Aircraft':
		modelKeys = ['location', 'site,', 'zone', 'organization', 'stance'];

		this.document.systems = {};
		this.source.systems = {};
		for (const prop in doc.systems) {
			// Possible spot for partial information on systems
			this.document.systems[prop] = doc.systems[prop];
			if (source) this.source.systems[prop] = { source, timestamp: clock.getTimeStamp() };
		}
		break;
	case 'Military':
		modelKeys = ['site,', 'origin', 'zone', 'organization'];
		break;
	case 'Facility':
		console.log('Currently remaking facility model');
		break;
	case 'Squad':
		modelKeys = ['location', 'site', 'origin', 'zone', 'organization'];
		break;
	case 'Site':
		modelKeys = ['name', 'zone', 'geoDMS', 'geoDecimal', 'unrest', 'loyalty', 'repression', 'morale', 'subType'];

		break;
	default:
		throw Error(`You can't get Recon Intel for a ${doc.model}`);
	}

	for (const key of [...commonKeys, ...modelKeys, ...randKeys]) {
		this.document[key] = doc[key];
		this.source[key] = { source, timestamp: clock.getTimeStamp() };
	}
	this.markModified('document');
	this.markModified('source');

	return await this.save();
};

IntelSchema.methods.espionageIntel = async function () {
	console.log('Rawr');
};

const Intel = mongoose.model('Intel', IntelSchema);

// { Aircraft Selectior Functions }
const generateIntel = async function (team, subject) {
	try {
		let doc = await Intel.findOne()
			.where('team').equals(team)
			.where('subject').equals(subject);
		if (!doc) {
			doc = new Intel({ team, subject });
			doc = await doc.save();
		}

		return doc;
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
	}
};

module.exports = { Intel, generateIntel };