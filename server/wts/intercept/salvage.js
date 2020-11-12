const salvageDebugger = require('debug')('app:intercept - salvage');
const CrashLog = require('../../models/logs/crashLog');
const { Site, GroundSite } = require('../../models/site');
const { d4 } = require('../../util/systems/dice');
const geo = require('../../util/systems/geo');
const randomCords = require('../../util/systems/lz');
const { genSiteCode } = require('../sites/sites');
let count = 0; // How many crashes have happened in the game.

async function generateSalvage (system, status) {
	const { Team } = require('../../models/team');
	if (status === 'Wreckage' || system.status.damaged === true) {
		const team = await Team.findOne({ type: 'C' });
		system.status.salvage = true;
		system.status.team = team._id;
		salvageDebugger(`${system.name} has been turned into wreckage...`);
	}
	else if (status === 'Damaged') {
		system.status.damaged = true;
		salvageDebugger(`${system.name} has been destroyed...`);
	}
	return system;
}

async function generateCrash (salvage, site) {
	const currentSite = await Site.findById({ _id: site }).populate('country');

	salvageDebugger(currentSite);
	salvageDebugger(salvage);

	const newDecimal = randomCords(currentSite.geoDecimal.latDecimal, currentSite.geoDecimal.longDecimal);

	const newNewDecimal = {
		latDecimal: newDecimal.lat,
		longDecimal: newDecimal.lng
	};

	const newDMS = {
		latDMS: geo.convertToDms(newDecimal.lat, false),
		longDMS: geo.convertToDms(newDecimal.lng, true)
	};

	const c0de = await genSiteCode();

	let crash = {
		name: `${currentSite.country.code} Crash - ${c0de}`,
		team: currentSite.team,
		subType: 'Crash',
		country: currentSite.country,
		zone: currentSite.zone,
		code: c0de,
		geoDMS: newDMS,
		geoDecimal: newNewDecimal,
		salvage: [...salvage],
		status: {
			public: false,
			secret: true
		}
	};

	const log = new CrashLog(crash);
	await log.save();
	crash = new GroundSite(crash);
	crash = await crash.save();
	console.log(crash);
}


function decimalCrash (dd, isLng) {
	const rand = d4();
	const plusOrMinus = Math.random() < 0.5 ? -1 : 1;

	const dir = dd < 0
		? isLng ? 'W' : 'S'
		: isLng ? 'E' : 'N';

	const absDd = Math.abs(dd);
	const deg = absDd | 0;
	const frac = absDd - deg;
	const min = (frac * 60) | 0;
	let sec = frac * 3600 - min * 60;

	// Round it to 2 decimal points.
	sec = Math.round(sec * 100) / 100;
	return deg + '°' + (min + (rand * plusOrMinus)) + '\'' + sec + '"' + dir;
}

module.exports = { generateSalvage, generateCrash };