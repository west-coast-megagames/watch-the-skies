const salvageDebugger = require('debug')('app:intercept - salvage');
const { Site } = require('../../models/site');
const { d4 } = require('../../systems/dice');
const geo = require('../../systems/geo');

const count = 0;

async function generateSalvage (system, status) {
	const { Team } = require('../../models/team');
	if (status === 'Wreckage' || system.status.damaged === true) {
		const team = await Team.findOne({ teamType: 'C' });
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

async function generateCrash (salvage, site, country) {
	const currentSite = await Site.findById({ _id: site }).populate('country');

	salvageDebugger(currentSite);
	salvageDebugger(salvage);

	const newDMS = {
		latDMS: decimalCrash(currentSite.geoDecimal.latDecimal, false),
		longDMS: decimalCrash(currentSite.geoDecimal.longDecimal, true)
	};

	const newDecimal = geo.parseDMS(`${newDMS.latDMS} ${newDMS.longDMS}`);

	const crash = {
		name: `${currentSite.country.name} Crash - ${currentSite.country.code}0${count}`,
		team: currentSite.team,
		country: currentSite.country,
		zone: currentSite.zone,
		code: `${currentSite.country.code}0${count}`,
		geoDMS: newDMS,
		geoDecimal: newDecimal,
		salvage: [...salvage],
		status: {
			public: false,
			secret: true
		}
	};

	console.log(crash);
}

function decimalCrash (dd, isLng) {
	const rand = d4();
	const plusOrMinus = Math.random() < 0.5 ? -1 : 1;

	const dir = dd < 0 ? (isLng ? 'W' : 'S') : isLng ? 'E' : 'N';

	const absDd = Math.abs(dd);
	const deg = absDd | 0;
	const frac = absDd - deg;
	const min = (frac * 60) | 0;
	let sec = frac * 3600 - min * 60;

	// Round it to 2 decimal points.
	sec = Math.round(sec * 100) / 100;
	return deg + '°' + (min + rand * plusOrMinus) + '\'' + sec + '"' + dir;
}

module.exports = { generateSalvage, generateCrash };
