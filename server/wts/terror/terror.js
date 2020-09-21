const { d6 } = require('../../util/systems/dice');

const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country');
const { Site } = require('../../models/site');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
const { TerrorReport } = require('../reports/reportClasses');

require ('winston-mongodb');

let gonePublic = false;

async function crisis (zoneId, crisis) {
	const terror = d6(); // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	const countryId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	zone = await Zone.findById(zoneId);
	if (zone) {
		oldTerror = zone.terror;
		zone.terror += terror;
		zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
		newTerror = zone.terror;
		await zone.save();

		reason = `Crisis: ${crisis.name} has caused ${terror}pts in ${zone.name}. Current Terror: ${zone.terror}`;
		logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
		logger.info(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
	else {
		reason = `Zone not available for terror crisis function for crisis: ${crisis.name} terror change ${terror}pts `;
		logger.error(`${reason}`);
		await console.log(`${reason}`);
		return reason;
	}
}

async function battle (countryId) {

	const terror = 10; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	country = await Country.findById(countryId);
	if (country) {
		zoneId = country.zone;
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror;
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			zoneId = zone._id;
			await zone.save();
			reason = `A battle in ${country.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			logger.info(`${reason}`);
			// await console.log(`${reason}`);
			return reason;
		}
		else {
			reason = `Zone not available for terror battle function: terror change ${terror}pts `;
			logger.error(`${reason}`);
			// await console.log(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Country not available for terror battle function: terror change ${terror}pts `;
		logger.error(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
}

async function invasion (countryId) {
	const terror = 2; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	country = await Country.findById(countryId);
	if (country) {
		zoneId = country.zone;
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `An invasion in ${country.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			logger.info(`${reason}`);
			// await console.log(${reason});
			return reason;
		}
		else {
			reason = `Zone not available for terror invasion function: terror change ${terror}pts `;
			logger.error(`${reason}`);
			// await console.log(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Country not available for terror invasion function: terror change ${terror}pts `;
		logger.error(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
}

async function publicAnnouncement () {
	let newTerror = 0;
	let oldTerror = 0;
	const countryId = null;
	const teamId = null;
	const siteId = null;
	let zoneId = null;
	let reason = '';

	const report = 'The public announcement of aliens has caused terror in all zones!';
	gonePublic = true;
	for await (const zone of await Zone.find()) {
		const terror = Math.trunc((250 - zone.terror) * 0.25); // Initial Terror caused by this event
		oldTerror = zone.terror;
		zone.terror += terror;
		zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
		newTerror = zone.terror;
		zoneId = zone._id;
		await zone.save(); // Saves Terror to Database
		reason = `The public announcement of aliens has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
		logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
		logger.info(`${reason}`);
		// console.log(`${reason}`);
	}
	return report;
}

async function coverage () {
	let newTerror = 0;
	let oldTerror = 0;
	const countryId = null;
	const teamId = null;
	const siteId = null;
	let zoneId = null;
	let reason = '';
	let report = '';

	const terror = 10; // Initial Terror caused by this event
	for await (const zone of await Zone.find()) {
		if (zone.satellite.length === 0) {
			oldTerror = zone.terror;
			zone.terror += terror;
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			zoneId = zone._id;
			await zone.save(); // Saves Terror to Database
			reason = `Lack of satellite coverage over has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			logger.info(`${reason}`);
			report = `${report} ${reason} | `;
		}
	}
	return report;
}

async function nuclearStrike (siteId) {
	const terror = 15; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let countryId = null;
	const teamId = null;
	let zoneId = null;
	let reason = '';
	let countryName = '';

	site = await Site.findById(siteId);
	if (site) {
		zoneId = site.zone;
		countryId = site.country;
		country = await Country.findById(countryId);
		if (country) {
			countryName = country.name;
		}
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `A nuclear strike on the ${site.name} in ${countryName} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			logger.info(`${reason}`);
			return reason;
		}
		else {
			reason = `Zone not available for terror nuclearStrike function: terror change ${terror}pts site: ${site.name}`;
			logger.error(`${reason}`);
			// await console.log(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Site not available for terror nuclearStrike function: terror change ${terror}pts site Id: ${siteId}`;
		logger.error(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
}

async function cityDestruction (siteId) {
	const terror = 20; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let countryId = null;
	const teamId = null;
	let zoneId = null;
	let reason = '';
	let countryName = '';

	site = await Site.findById(siteId);
	if (site) {
		zoneId = site.zone;
		countryId = site.country;
		country = await Country.findById(countryId);
		if (country) {
			countryName = country.name;
		}
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `The destruction of ${site.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			logger.info(`${reason}`);
			return reason;
		}
		else {
			reason = `Zone not available for terror cityDestruction function: terror change ${terror}pts site: ${site.name}`;
			logger.error(`${reason}`);
			// await console.log(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Site not available for terror cityDestruction function: terror change ${terror}pts site Id: ${siteId}`;
		logger.error(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
}

async function industryDestruction (countryId) {
	const terror = 15; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	country = await Country.findById(countryId);
	if (country) {
		zoneId = country.zone;
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `The destruction of industry in ${country.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logger.info(`${reason}`);
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			return reason;
		}
		else {
			reason = `Zone not available for terror industryDestruction function in ${country.name}: terror change ${terror}pts `;
			logger.error(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Country not available for terror industryDestruction function: terror change ${terror}pts country Id: ${countryId}`;
		logger.error(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
}

async function alienActivity (countryId) {
	const terror = gonePublic ? 2 : 1; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	country = await Country.findById(countryId);
	if (country) {
		zoneId = country.zone;
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `Alien activity in ${country.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			logger.info(`${reason}`);
			return reason;
		}
		else {
			reason = `Zone not available for terror alienActivity function in ${country.name}: terror change ${terror}pts `;
			logger.error(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Country not available for terror alienActivity function: terror change ${terror}pts country Id: ${countryId}`;
		logger.error(`${reason}`);
		return reason;
	}
}

async function alienRaid (countryId) {
	const terror = gonePublic ? 3 : 2; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	country = await Country.findById(countryId);
	if (country) {
		zoneId = country.zone;
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `Alien raid in ${country.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			return reason;
		}
		else {
			reason = `Zone not available for terror alienRaid function in ${country.name}: terror change ${terror}pts `;
			logger.error(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Country not available for terror alienRaid function: terror change ${terror}pts country Id: ${countryId}`;
		logger.error(`${reason}`);
		return reason;
	}
}

async function alienGroundForces (countryId) {
	const terror = gonePublic ? 4 : 3; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	country = await Country.findById(countryId);
	if (country) {
		zoneId = country.zone;
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `Alien ground troops in ${country.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			return reason;
		}
		else {
			reason = `Zone not available for terror alienGroundForces function in ${country.name}: terror change ${terror}pts `;
			logger.error(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Country not available for terror alienGroundForces function: terror change ${terror}pts country Id: ${countryId}`;
		logger.error(`${reason}`);
		return reason;
	}
}

async function orbitalStrike (siteId) {
	const terror = 20; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let countryId = null;
	const teamId = null;
	let zoneId = null;
	let reason = '';
	let countryName = '';

	site = await Site.findById(siteId);
	if (site) {
		zoneId = site.zone;
		countryId = site.country;
		country = await Country.findById(countryId);
		if (country) {
			countryName = country.name;
		}
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `An orbital strike on ${site.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, countryId, teamId, siteId);
			return reason;
		}
		else {
			reason = `Zone not available for terror orbitalStrike function: terror change ${terror}pts site: ${site.name}`;
			logger.error(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Site not available for terror orbitalStrike function: terror change ${terror}pts site Id: ${siteId}`;
		logger.error(`${reason}`);
		return reason;
	}
}

async function logTerror (oldTerror, terror, newTerror, reason, zone, country, team, site) {

	const report = new TerrorReport;
	report.date = Date.now();
	report.team = team;
	report.country = country;
	report.zone = zone;
	report.terrorMessage = reason;
	report.startTerror = oldTerror;
	report.addTerror = terror;
	report.endTerror = newTerror;
	report.targetSite = site;

	await report.saveReport();

}

const terror = { battle, coverage, crisis, cityDestruction, nuclearStrike, industryDestruction, alienActivity,
	alienRaid, alienGroundForces, orbitalStrike, invasion, publicAnnouncement };

module.exports = terror;