// Main System document for the Intel system

// Intel is how any TEAM <Mongoose Object> knows about other DATA <Mongoose Objects> that belong to other teams.

const reconIntel = async function (doc, source = undefined, score = 0) {
	this.type = doc.model.toLowerCase();
	if (!this.document.name) this.document.name = randCode(6);
	const commonKeys = ['_id', 'model', 'team', '__t', 'tags', 'status', 'name']; // TODO - Remove name
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

	// Switch that determines what fields are populated? - Likely place for Intel Score to apply
	switch (doc.model) {
	case 'Aircraft':
		modelKeys = ['location', 'site,', 'zone', 'organization', 'stance', 'origin'];

		this.document.systems = {};
		this.source.systems = {};
		for (const prop in doc.systems) {
			// Possible spot for partial information on systems
			this.document.systems[prop] = doc.systems[prop];
			if (source) this.source.systems[prop] = { source, timestamp: clock.getTimeStamp() };
		}
		break;
	case 'Military':
		modelKeys = ['site,', 'origin', 'zone', 'organization', 'stance', 'origin'];
		break;
	case 'Facility':
		modelKeys = ['name', 'buildings', 'capabilities', 'site',  'assignment', 'type', 'upgrades'];
		console.log('Currently making facility intel');
		break;
	case 'Squad':
		modelKeys = ['location', 'site', 'origin', 'zone', 'organization'];
		break;
	case 'Site':
		modelKeys = ['name', 'zone', 'geoDMS', 'geoDecimal', 'unrest', 'loyalty', 'repression', 'morale', 'subType'];

		// Generates Intel on Facilities currently at the target site
		try {
			const facilities = await Facility.find()
				.where('site').equals(`${doc._id}`)
			for (const facility of facilities) {
				await facility.populateMe();
				let intel = await generateIntel(doc.team, facility._id);
				await intel.reconIntel(facility.toObject(), source)
			}
		}
		catch(err) {
			console.log(err);
		};

		// Generates Intel on Military currently at the target site
		try {
			const units = await Military.find()
				.where('site').equals(`${doc._id}`)
			for (const unit of units) {
				await unit.populateMe();
				let intel = await generateIntel(doc.team, unit._id);
				await intel.reconIntel(unit.toObject(), source);
			}
		}
		catch(err) {
			console.log(err);
		};

		// Temp addition for aircraft information for Scott, remove later!
		try {
			const units = await Aircraft.find()
				.where('site').equals(`${doc._id}`)
			for (const unit of units) {
				await unit.populateMe();
				let intel = await generateIntel(doc.team, unit._id);
				await intel.reconIntel(unit.toObject(), source);
			}
		}
		catch(err) {
			console.log(err);
		};

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

const surveillanceIntel = async function (doc, source = undefined, score = 0) {
	logger.info(`Generating Surveillance...`);
	// This method generates surveillance intel once the check for it is made

	this.type = doc.model.toLowerCase();
	if (!this.document.name) this.document.name = randCode(6);
	const commonKeys = ['_id', 'model', 'team', '__t', 'tags', 'status', 'name']; // TODO - Remove name
	let modelKeys = [];
	let randKeys = [];

	// Switch that determines what fields are populated? - Likely place for Intel Score to apply
	switch (doc.model) {
	case 'Aircraft':
		console.log('Currently making aircraft intel from Survaillance');
		modelKeys = ['location', 'site,', 'zone'];
		break;
	case 'Military':
		modelKeys = ['location', 'site,', 'zone'];
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

IntelSchema.methods.espionageIntel = async function () {
	console.log('Rawr');
};

const Intel = mongoose.model('Intel', IntelSchema);

// generateIntel function, checks if the team has an intel object for the target and either pulls it up or creates one
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