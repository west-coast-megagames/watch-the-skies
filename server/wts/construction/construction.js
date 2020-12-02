const { Aircraft } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const { FacilityBlueprint, AircraftBlueprint, UpgradeBlueprint } = require('../../models/blueprint');
const { logger } = require('../../middleware/log/logging'); // Import of winston for error logging
require('winston-mongodb');

// const { loadBlueprints } = require('../../wts/construction/blueprintLoad');
const { Upgrade } = require('../../models/upgrade');

// construction function for building Squads, Military(?), and Aircraft
async function newUnit (name, facility, type, team) {
	// await loadBlueprints(); // this can me taken out when you implement the init loadBlueprints
	let blue = undefined;
	let base = undefined;
	let fighter = undefined;
	let err = '';

	switch(type) {
	case 'Fighter':
		blue = await AircraftBlueprint.findOne({ type: type }); // Find BP by ID in the future.
		base = await Facility.findById(facility).populate('site');

		fighter = new Aircraft({
			name,
			team,
			zone: base.site.zone._id,
			country: base.site.country._id,
			site: base.site._id,
			origin: facility,
			mission: 'Under Construction',
			stats: blue.stats,
			type: blue.type
		});

		fighter.status.ready = false;
		fighter.status.building = true;

		fighter = await fighter.save();

		return fighter;
	default:
		err = 'Could not determine what type of unit was wanted for construction...';
		logger.error(`newUnit Construction Error for ${type} ${name}: ${err}`);
		return err;

	}

}

// construction function for making a new upgrade
async function newUpgrade (code, team, facility) {
	// await loadBlueprints(); // this can me taken out when you implement the init loadBlueprints

	// const x = await UpgradeBlueprint.find();
	const blue = await UpgradeBlueprint.findOne({ code: code });
	if (!blue) return (`Could not find Blueprint of ${code}`);
	const upgrade = new Upgrade();
	upgrade.team = team;
	upgrade.facility = facility;
	upgrade.name = blue.name;
	upgrade.cost = blue.cost;
	upgrade.buildTime = blue.buildTime;
	upgrade.desc = blue.desc;
	upgrade.prereq = blue.prereq;
	upgrade.code = blue.code;
	upgrade.manufacturer = team;
	upgrade.effects = blue.effects;

	return upgrade;
}

async function newFacility (bpCode, code, name, site, team) {
	// await loadBlueprints(); // this can me taken out when you implement the init loadBlueprints
	let err = '';
	try{
		const blue = await FacilityBlueprint.findOne({ code: bpCode }); // findOne({ name: iData.name });
		if (!blue) {
			err = 'Could not find Facility Blueprint ${bpCode}';
			return err;
		}

		const facility = new Facility(blue);

		facility.name = name;
		facility.site = site;
		facility.code = code;
		facility.team = team;
		const saveFacility = await facility.save();

		return saveFacility;
	}
	catch(err) {
		logger.error(`newFacility Construction Error for ${code} ${name}: ${err.message}`, { meta: err.stack });
		return err;
	}

}
module.exports = { newUnit, newUpgrade, newFacility };
