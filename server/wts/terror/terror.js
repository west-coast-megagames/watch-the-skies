const { d6 } = require('../../util/systems/dice');

const { Zone } = require('../../models/zone');
const { Organization } = require('../../models/organization');
const { Site } = require('../../models/site');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging
const { TerrorLog } = require('../../models/logs/log');

require ('winston-mongodb');

let gonePublic = false;

async function crisis (zoneId, crisis) {
	const terror = d6(); // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	const organizationId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	let zone = await Zone.findById(zoneId);
	if (zone) {
		oldTerror = zone.terror;
		zone.terror += terror;
		zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
		newTerror = zone.terror;
		await zone.save();

		reason = `Crisis: ${crisis.name} has caused ${terror}pts in ${zone.name}. Current Terror: ${zone.terror}`;
		TerrorLog(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
		logger.info(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
	else {
		reason = `Zone not available for terror crisis function for crisis: ${crisis.name} terror change ${terror}pts `;
		logger.error(`${reason}`);
		console.log(`${reason}`);
		return reason;
	}
}

async function battle (organizationId) {

	const terror = 10; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	let organization = await Organization.findById(organizationId);
	if (organization) {
		zoneId = organization.zone;
		let zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror;
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			zoneId = zone._id;
			await zone.save();
			reason = `A battle in ${organization.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
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
		reason = `Organization not available for terror battle function: terror change ${terror}pts `;
		logger.error(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
}

async function invasion (organizationId) {
	const terror = 2; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	const organization = await Organization.findById(organizationId);
	if (organization) {
		zoneId = organization.zone;
		const zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `An invasion in ${organization.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
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
		reason = `Organization not available for terror invasion function: terror change ${terror}pts `;
		logger.error(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
}

async function publicAnnouncement () {
	let newTerror = 0;
	let oldTerror = 0;
	const organizationId = null;
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
		logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
		logger.info(`${reason}`);
		// console.log(`${reason}`);
	}
	return report;
}

async function coverage () {
	let newTerror = 0;
	let oldTerror = 0;
	const organizationId = null;
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
			logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
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
	let organizationId = null;
	const teamId = null;
	let zoneId = null;
	let reason = '';
	let organizationName = '';

	site = await Site.findById(siteId);
	if (site) {
		zoneId = site.zone;
		organizationId = site.organization;
		organization = await Organization.findById(organizationId);
		if (organization) {
			organizationName = organization.name;
		}
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `A nuclear strike on the ${site.name} in ${organizationName} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
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
	let organizationId = null;
	const teamId = null;
	let zoneId = null;
	let reason = '';
	let organizationName = '';

	site = await Site.findById(siteId);
	if (site) {
		zoneId = site.zone;
		organizationId = site.organization;
		organization = await Organization.findById(organizationId);
		if (organization) {
			organizationName = organization.name;
		}
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `The destruction of ${site.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
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

async function industryDestruction (organizationId) {
	const terror = 15; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	organization = await Organization.findById(organizationId);
	if (organization) {
		zoneId = organization.zone;
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `The destruction of industry in ${organization.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logger.info(`${reason}`);
			logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
			return reason;
		}
		else {
			reason = `Zone not available for terror industryDestruction function in ${organization.name}: terror change ${terror}pts `;
			logger.error(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Organization not available for terror industryDestruction function: terror change ${terror}pts organization Id: ${organizationId}`;
		logger.error(`${reason}`);
		// await console.log(`${reason}`);
		return reason;
	}
}

async function alienActivity (siteID, mission) {
	let terror = gonePublic ? 2 : 1; // Default is Air mission
	let newTerror = 0;
	let oldTerror = 0;
	let reason = '';

	if (mission === 'Transport') {
		terror = gonePublic ? 3 : 2;
	}
	else if (mission === 'Raid') {
		terror = gonePublic ? 4 : 3;
	}

	const site = await Site.findById(siteID);
	if (site) {
		const zone = await Zone.findById(site.zone._id);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `Alien ${mission} mission in ${site.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			let log = new TerrorLog({
				date: Date.now(),
				team: site.team._id,
				organization: site.organization._id,
				zone: site.zone._id,
				site: site._id,
				startTerror: oldTerror,
				endTerror: newTerror,
				terror,
				reason
			});
			log = log.createTimestamp(log);
			await log.save();
			logger.info(`${reason}`);
			return reason;
		}
		else {
			reason = `Zone not available for terror alienActivity function in ${site.name}: terror change ${terror}pts `;
			logger.error(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Organization not available for terror alienActivity function: terror change ${terror}pts site Id: ${siteId}`;
		logger.error(`${reason}`);
		return reason;
	}
}

async function alienRaid (organizationId) {
	const terror = gonePublic ? 3 : 2; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	organization = await Organization.findById(organizationId);
	if (organization) {
		zoneId = organization.zone;
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `Alien raid in ${organization.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
			return reason;
		}
		else {
			reason = `Zone not available for terror alienRaid function in ${organization.name}: terror change ${terror}pts `;
			logger.error(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Organization not available for terror alienRaid function: terror change ${terror}pts organization Id: ${organizationId}`;
		logger.error(`${reason}`);
		return reason;
	}
}

async function alienGroundForces (organizationId) {
	const terror = gonePublic ? 4 : 3; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let zoneId = null;
	const teamId = null;
	const siteId = null;
	let reason = '';

	organization = await Organization.findById(organizationId);
	if (organization) {
		zoneId = organization.zone;
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `Alien ground troops in ${organization.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
			return reason;
		}
		else {
			reason = `Zone not available for terror alienGroundForces function in ${organization.name}: terror change ${terror}pts `;
			logger.error(`${reason}`);
			return reason;
		}
	}
	else {
		reason = `Organization not available for terror alienGroundForces function: terror change ${terror}pts organization Id: ${organizationId}`;
		logger.error(`${reason}`);
		return reason;
	}
}

async function orbitalStrike (siteId) {
	const terror = 20; // Initial Terror caused by this event
	let newTerror = 0;
	let oldTerror = 0;
	let organizationId = null;
	const teamId = null;
	let zoneId = null;
	let reason = '';
	let organizationName = '';

	site = await Site.findById(siteId);
	if (site) {
		zoneId = site.zone;
		organizationId = site.organization;
		organization = await Organization.findById(organizationId);
		if (organization) {
			organizationName = organization.name;
		}
		zone = await Zone.findById(zoneId);
		if (zone) {
			oldTerror = zone.terror;
			zone.terror += terror; // Assigns terror to zone
			zone.terror = Math.min(zone.terror, 250); // don't go beyond 250
			newTerror = zone.terror;
			await zone.save(); // Saves Terror to Database
			reason = `An orbital strike on ${site.name} has caused ${terror}pts of terror in ${zone.name}. Current Terror: ${zone.terror}`;
			logTerror(oldTerror, terror, newTerror, reason, zoneId, organizationId, teamId, siteId);
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

const terror = { battle, coverage, crisis, cityDestruction, nuclearStrike, industryDestruction, alienActivity,
	alienRaid, alienGroundForces, orbitalStrike, invasion, publicAnnouncement };

module.exports = terror;