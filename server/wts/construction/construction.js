const { Aircraft } = require('../../models/ops/aircraft');
const { Facility } = require('../../models/facility');
const { Squad } = require('../../models/ops/squad');
const { Military } = require('../../models/ops/military/military');
const { FacilityBlueprint, AircraftBlueprint, UpgradeBlueprint, Blueprint } = require('../../models/blueprint');

const { loadBlueprints } = require('../../wts/construction/blueprintLoad');
const { Upgrade } = require('../../models/upgrade');

// construction function for building Squads, Military(?), and Aircraft
async function newUnit (name, facility, type, team) {
	await loadBlueprints(); // this can me taken out when you implement the init loadBlueprints

	switch(type) {
	case 'Fighter':
		const blue = await AircraftBlueprint.findOne({ type: type }); // Find BP by ID in the future.
		const base = await Facility.findById(facility).populate('site');

		let fighter = new Aircraft({
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
		return err = 'Could not determine what type of unit was wanted for construction...';

	}

}

// construction function for making a new upgrade
async function newUpgrade (code, team, facility) {
	await loadBlueprints(); // this can me taken out when you implement the init loadBlueprints

	const x = await UpgradeBlueprint.find();
	const blue = await UpgradeBlueprint.findOne({ code: code });
	const upgrade = new Upgrade(blue);
	upgrade.team = team;
	upgrade.facility = facility;

	return upgrade;
}

async function newFacility (name, site, team) {
	await loadBlueprints(); // this can me taken out when you implement the init loadBlueprints
	try{
		const blue = await FacilityBlueprint.findOne({ code: 'BS-1' }); // findOne({ name: iData.name });
		if (!blue) {return err = 'Could not find Facility Blueprint';}

		const facility = new Facility(blue);

		facility.name = name;
		facility.site = site;
		// facility.code = code;
		facility.team = team;
		// facility = await facility.save();

		return facility;
	}
	catch(err) {
		return err;
	}

}
module.exports = { newUnit, newUpgrade, newFacility };
