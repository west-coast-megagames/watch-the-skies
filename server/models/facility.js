const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { generateIntel } = require('./intel');
const { getDistance } = require('../util/systems/geo');

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const BuildingSchema = new Schema({
	type: { type: String, enum: [ 'port', 'manufacturing', 'surveillance', 'garrison', 'research', 'storage', 'recon', 'hanger', 'aid', 'production', 'defense', 'anti-nuke' ] },
	stats: {
		capacity: { type: Number },
		funding: { type: Number },
		range: { type: Number },
		rate: { type: Number },
		bonus: { type: Number },
		detection: { type: Number }
	},
	damaged: { type: Boolean, default: false, required: true },
	research: { type: ObjectId, ref: 'Research' },
	aircrafts: [{ type: ObjectId, ref: 'Aircraft' }],
	upgrades: [{ type: ObjectId, ref: 'Upgrade' }],
	units: [{ type: ObjectId, ref: 'Military' }]
});

// type can be: "Civilian", "Crises", "Hanger", "Research", "Base", and "Space" (for spacecraft) currently
const FacilitySchema = new Schema({
	model: { type: String, default: 'Facility' },
	type: { type: String, min: 2, maxlength: 50 },
	name: { type: String, required: true, min: 2, maxlength: 50 },
	team: { type: ObjectId, ref: 'Team' },
	site: { type: ObjectId, ref: 'Site' },
	code: { type: String, minlength: 2, maxlength: 20, required: true, unique: true },
	status: [ { type: String, enum: ['repair', 'damaged', 'destroyed', 'secret', 'defenses'] } ],
	hidden: { type: Boolean, default: false },
	upgrade: [{ type: ObjectId, ref: 'Upgrade' }],
	buildings: [BuildingSchema],
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	tags: [ { type: String, enum: ['coastal'] } ],
	capabilities: [ { type: String, enum: [ 'port', 'manufacturing', 'surveillance', 'garrison', 'research', 'storage', 'recon', 'hanger', 'aid', 'production', 'defense', 'anti-nuke' ] }]
}, { timestamps: true });

FacilitySchema.virtual('range').get(function () {
	let range = 0;
	for (const building of this.buildings.filter(el => el.type === 'surveillance')) {
		if (building.stats.range) {
			range += building.stats.range;
		}
	}
	return (range);
});

FacilitySchema.virtual('detection').get(function () {
	let detection = 0;
	for (const building of this.buildings.filter(el => el.type === 'surveillance')) {
		if (building.stats.rate) {
			detection += building.stats.rate;
		}
	}
	return (detection);
});

// METHOD - Surveillance
// IN: Target (Site/Facility/Aircraft/Military) | OUT: VOID
// PROCESS: Generates intel in the target site
FacilitySchema.methods.surveillance = async function(target) {
	try {
		// Add in Intel report - for service record
		if (target.team !== this.team._id) {
			let intel = await generateIntel(this.team, target._id);
			await intel.surveillanceIntel(target, `${this.name} surveillance...`) // Calls the surveillanceIntel method of the
		}
	} catch (err) {
		console.log(`Facility Surveillance - ${err.message}`);
		logger.error(err.message, { meta: err.stack });
	}
}

FacilitySchema.methods.validateFacility = async function () {
	const { validTeam, validSite, validUpgrade, validResearch, validAircraft, validMilitary } = require('../middleware/util/validateDocument');

	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		type: Joi.string().min(2).max(50).valid('Civilian', 'Crises', 'Hanger', 'Research', 'Base', 'Space'),
		code: Joi.string().min(2).max(20).required(),
		tags: Joi.array().items(Joi.string().valid('coastal')),
		status: Joi.array().items(Joi.string().valid('repair', 'damaged', 'destroyed', 'secret', 'defenses'))
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	if (this.site) {
		await validSite(this.site);
	}

	if (this.team) {
		await validTeam(this.team);
	}
	
	for await (const upg of this.upgrade) {
		await validUpgrade(upg);
	}

	if (this.buildings.research) {
		await validResearch(this.buildings.research);
	}
	
	if (this.buildings.aircrafts) {
	  for await (const aircrft of this.buildings.aircrafts) {
	  	await validAircraft(aircrft);
		}
	}

	if (this.buildings.units) {
	  for await (const milUnit of this.buildings.units) {
		  await validMilitary(milUnit);
		}
	}
};

FacilitySchema.methods.populateMe = function () {
	return this
		.populate('site', 'name type geoDecimal')
		.populate('team', 'shortName name sciRate')
		.populate('research')
		.populate('upgrade')
		.execPopulate();
};

const Facility = mongoose.model('Facility', FacilitySchema);

// In range selector - Facilities
const getFacilitiesInRange = async function (tags, geoDecimal) {
	let facilities = await Facility.find()
		.where('capabilities').in(tags)
		.populate('site', 'geoDecimal'); // 1) Find all Facilities with surviellence tags

	facilities = facilities.filter(facility => getDistance(facility.site.geoDecimal.lat, facility.site.geoDecimal.lng, geoDecimal.lat, geoDecimal.lng) <= facility.range);
	return facilities;
};

const getFacilitiesInSite = async function (site_id) {
	return await Facility.find()
		.where('site').equals(`${site_id}`);
};

module.exports = { Facility, getFacilitiesInRange, getFacilitiesInSite };
