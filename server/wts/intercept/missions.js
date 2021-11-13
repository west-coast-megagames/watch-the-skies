const missionDebugger = require('debug')('app:missions - air');
const { intercept } = require('./intercept2'); // Second version of an intercept system
const { d6 } = require('../../util/systems/dice'); // Six Sided dice roll
const terror = require('../terror/terror');

// Intercept System Imports

// Mongoose Models
const { Aircraft } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const { Site } = require('../../models/site');

// Utility Imports
const { getDistance } = require('../../util/systems/geo');
const dynReport = require('./battleDetails');
const { generateSite } = require('../sites/sites');
const { AirMission } = require('../../models/report');
const { randCode } = require('./battleDetails');
const { addArrayValue } = require('../../middleware/util/arrayCalls');


let interceptionMissions = []; // Attempted Interception missions for the round
let escortMissions = []; // Attempted Escort missions for the round
let patrolMissions = []; // Attempted Patrol missions for the round
let transportMissions = []; // Attempted Transport missions for the round
let reconMissions = []; // Attempted Recon missions for the round
let diversionMissions = []; // Attempted Diversion missions for the round

let count = 0; // Mission Counter.
// let totalCount = 0;

// Start function | loads in an aircraft & target as well as the mission type and saves them for resolution
async function start(aircraft, target, mission) {
	let result = `Plan for ${mission.toLowerCase()} mission by ${aircraft.name} submitted.`;
	const origin = await Facility.findById(aircraft.origin).populate('site'); // Populate home facility for the aircraft
	let distance;
	let targetGeo = undefined; // Initiate targets Geo position placeholder

	if (mission === 'Transfer') {
		targetGeo = target.site.geoDecimal;
		distance = 999;
	}
	else {
		target.model === 'Aircraft' || target.model === 'Facility' ? targetGeo = target.site.geoDecimal : targetGeo = target.geoDecimal; // Assign targets geo position

		const { lat, lng } = origin.site.geoDecimal; // Destructure aircrafts launch position

		aircraft = aircraft._id; // Saves just the _ID of the aircraft
		target = target._id; // Saves just the _ID of the target

		missionDebugger(targetGeo);
		missionDebugger(origin.site.geoDecimal);
		distance = getDistance(lat, lng, targetGeo.lat, targetGeo.lng); // Get distance to target in KM
		missionDebugger(`Mission distance ${distance}km`);
	}

	// SWITCH Sorts the mission into the correct mission
	const newMission = [{ aircraft, target, distance, origin, mission }]; // Saves the mission combination
	switch (true) {
	case mission === 'interception':
		interceptionMissions = [...interceptionMissions, ...newMission]; // Adds Interception to be resolved
		missionDebugger(interceptionMissions);
		break;
	case mission === 'escort':
		escortMissions = [...escortMissions, ...newMission]; // Adds Escort to be resolved
		missionDebugger(escortMissions);
		break;
	case mission === 'patrol':
		patrolMissions = [...patrolMissions, ...newMission]; // Adds Patrol to be resolved
		missionDebugger(patrolMissions);
		break;
	case mission === 'transport':
		transportMissions = [...transportMissions, ...newMission]; // Adds Transport to be resolved
		missionDebugger(transportMissions);
		break;
	case mission === 'recon site' || mission === 'recon aircraft':
		reconMissions = [...reconMissions, ...newMission]; // Adds Recon to be resolved
		missionDebugger(reconMissions);
		break;
	case mission === 'diversion':
		diversionMissions = [...diversionMissions, ...newMission]; // Adds Recon to be resolved
		missionDebugger(diversionMissions);
		break;
	default:
		result = `${result} This is not an acceptable mission type.`;
		throw new Error(`Invalid Air Mission: ${mission} is not a valid mission type.`);
	}

	missionDebugger(interceptionMissions.sort((a, b) => a.distance - b.distance));
	missionDebugger(`${result}`);

	return result;
}

// Function for resolving missions when the Team Phase ends.
async function resolveMissions() {
	missionDebugger('Resolving Missions...');

	await runInterceptions(); // Runs through all Inteception Missions | Checks for escorts
	await runTransports(); // Runs through all Transport missions | Checks for Patrols
	await runRecon(); // Runs through all Recon missions | Checks for escorts and Patrols
	await runDiversions(); // Runs through all diversion missions | Checks for any Patrols
	await clearMissions();

	missionDebugger(`Mission resolution complete. Mission Count: ${count}`);
	// totalCount += count;
	count = 0;

	return 0;
}

// Iterate over all submitted Interceptions in range order
async function runInterceptions() {
	for await (const interception of interceptionMissions.sort((a, b) => a.distance - b.distance)) {
		count++; // Count iteration for each interception
		const missionCode = randCode(5); // Generates a unique code for this interception
		missionDebugger(`Mission #${count} - Interception`);

		const aircraft = await Aircraft.findById(interception.aircraft).populate('organization', 'name').populate('team', 'name').populate('upgrades'); // Gets the Initiator from the DB
		let atkReport = new AirMission({
			type: 'Interception', 					// Records the After Action Report Type
			code: missionCode, 							// Unique code for this encounter
			mission: interception.mission,	// Mission type from the attacking unit
			team: aircraft.team,						// Team of the attacking unit
			organization: aircraft.organization._id,	// Organization the mission is taking place over
			zone: aircraft.zone._id,				// Zone the mission is in
			site: aircraft.site._id,				// Site the mission is over
			aircraft: aircraft._id,					// ID of the aircraft this report is for
			report: `${aircraft.name} en route to ${aircraft.organization.name} airspace on mission ${missionCode}. Projected target intercept is ${interception.distance.toFixed(2)}km away.`,
			position: 'offense'							// Designates this aircraft as the offense or defense
		});

		// Skips mission if the current aircraft is dead
		if (aircraft.status.some(el => el === 'destroyed')) {
			missionDebugger(`DEAD Aircraft Flying: ${aircraft.name}`);
			atkReport.type = 'Failure';
			atkReport.report += ` ${aircraft.name} was destroyed prior to intercept.`,
			await addArrayValue(atkReport.status, 'complete');
			atkReport = atkReport.createTimestamp(atkReport);
			await atkReport.save();
			continue;
		}

		let target = await Aircraft.findById(interception.target).populate('organization', 'name').populate('upgrades').populate('team'); // Gets the Target from the DB
		missionDebugger(`${aircraft.name} vs. ${target.name}`);

		const escortCheck = await checkEscort(interception.target, undefined, atkReport); // Checks to see if the target is escorted

		target = escortCheck.target;
		const defReport = escortCheck.defReport;


		if (target.status.some(el => el === 'destroyed') || target.systems.length < 1) {
			atkReport.type = 'Failure';
			atkReport.report += ' Mission target was destroyed prior to intercept.',
			await addArrayValue(atkReport.status, 'complete');
			atkReport = atkReport.createTimestamp(atkReport);
			await atkReport.save();
			continue;
		}

		missionDebugger(`${aircraft.name} is engaging ${target.name}.`);
		await intercept(aircraft, atkReport, target, defReport);
	}
	return;
}

// Iterate over all remaining transport missions
async function runTransports() {
	for await (const transport of transportMissions.sort((a, b) => a.distance - b.distance)) {
		count++; // Count iteration for each mission
		const missionCode = randCode(5); // Generates a unique code for this transport
		missionDebugger(`Mission #${count} - Transport Mission`);

		const aircraft = await Aircraft.findById(transport.aircraft).populate('organization', 'name').populate('upgrades').populate('team');

		if (aircraft.status.some(el => el === 'destroyed')) {
			console.log(`DEAD Aircraft Flying: ${aircraft.name}`);
			continue;
		}

		const target = await Site.findById(transport.target); // Loading Site that the transport is heading to.
		missionDebugger(`${aircraft.name} transporting cargo to ${target.name}`);

		let atkReport = new AirMission({
			type: 'Transport', 							// Records the After Action Report Type
			code: missionCode, 							// Unique code for this encounter
			mission: transport.mission,			// Mission type from the attacking unit
			team: aircraft.team,						// Team of the attacking unit
			organization: aircraft.organization._id,	// Organization the mission is taking place over
			zone: aircraft.zone._id,				// Zone the mission is in
			site: aircraft.site._id,				// Site the mission is over
			aircraft: aircraft._id,					// ID of the aircraft this report is for
			report: `${aircraft.name} has launched for a hauling run, en route to ${target.name}. Mission target is ${transport.distance.toFixed(2)}km away in a ${aircraft.organization.name} controlled region.`,
			position: 'offense'							// Designates this aircraft as the offense or defense
		});

		if (aircraft.team.type === 'Alien') terror.alienActivity(aircraft.site, 'Transport');

		const patrolCheck = await checkPatrol(transport.target, atkReport, aircraft);

		if (patrolCheck.continue === true) {
			atkReport.report = `${atkReport.report} ${aircraft.name} arrived safely at ${target.name}.`;
			missionDebugger(`${aircraft.name} arrived safely at ${target.name}`);
			atkReport = atkReport.createTimestamp(atkReport);
			await atkReport.save();

			// Schedule a ground mission.

			// create new ground site
			generateSite(target._id);

			await aircraft.recall();
		}
	}

	return;
}

// Iterate over all remaining Recon missions - DONE [NOT TESTED]
async function runRecon() {
	for await (const recon of reconMissions.sort((a, b) => a.distance - b.distance)) {
		count++; // Count iteration for each mission
		const missionCode = randCode(5); // Generates a unique code for this recon mission
		missionDebugger(`Mission #${count} - Recon Mission`);
		const aircraft = await Aircraft.findById(recon.aircraft)
			.populate('organization', 'name')
			.populate('upgrades')
			.populate('origin')
			.populate('team');
		// let atkReport = `${aircraft.name} conducting surveillance in ${aircraft.organization.name}.`;

		if (aircraft.mission === 'Recon Aircraft') {
			let target = await Aircraft.findById(recon.target); // Loading Aircraft that the recon is heading to.

			let atkReport = new AirMission({
				type: 'Recon', 							// Records the After Action Report Type
				code: missionCode, 							// Unique code for this encounter
				mission: recon.mission,			// Mission type from the attacking unit
				team: aircraft.team._id,						// Team of the attacking unit
				organization: aircraft.organization._id,	// Organization the mission is taking place over
				zone: aircraft.zone._id,				// Zone the mission is in
				site: aircraft.site._id,				// Site the mission is over
				aircraft: aircraft._id,
				unit: aircraft.toObject(),				// ID of the aircraft this report is for
				report: `${aircraft.name} has launched to gather intel, en route to ${target.name}. Mission target is ${recon.distance.toFixed(2)}km away in a ${aircraft.organization.name} controlled region.`,
				position: 'offense'							// Designates this aircraft as the offense or defense
			});

			if (target.status.some(el => el === 'destroyed') || target.systems.length < 1) {
				atkReport.report = `${atkReport.report} Target has been shot down prior to recon.`;
				atkReport = atkReport.createTimestamp(atkReport);
				await atkReport.save();
				continue;
			}

			const escortCheck = await checkEscort(recon.target, undefined, atkReport);

			// Check if we are still doing a recon mission or being intercepted.
			if (escortCheck.target._id.toHexString() === recon.target.toHexString()) {
				// toHexString allows checking equality for _id
				atkReport.report = `${atkReport.report} ${aircraft.name} safely gathered information on ${target.type} and safely returned to base.`;

				// eslint-disable-next-line no-unused-vars
				const roll = d6();

				// Generate Intel
				// Make intel addition to the report

				atkReport = atkReport.createTimestamp(atkReport);
				await atkReport.save();

				await aircraft.recall();
				return;
			}
			else {
				target = escortCheck.target; // Target, now the unit countering the recon attempt
				const defReport = escortCheck.defReport; // The unit defending from recon, becomes the attacker for the interception

				missionDebugger(`${aircraft.name} is engaging ${target.name}.`);
				atkReport.report = `${atkReport.report} ${aircraft.name} engaged ${target.type}.`;
				await intercept(target, defReport, aircraft, atkReport);
				return;
			}
		}

		if (aircraft.mission === 'Recon Site') {
			const target = await Site.findById(recon.target); // Loading Site that the recon is heading to.

			let atkReport = new AirMission({
				type: 'Recon', 							// Records the After Action Report Type
				code: missionCode, 							// Unique code for this encounter
				mission: recon.mission,			// Mission type from the attacking unit
				team: aircraft.team._id,						// Team of the attacking unit
				organization: aircraft.organization._id,	// Organization the mission is taking place over
				zone: aircraft.zone._id,				// Zone the mission is in
				site: aircraft.site._id,				// Site the mission is over
				aircraft: aircraft._id,
				unit: aircraft.toObject(),				// ID of the aircraft this report is for
				report: `${aircraft.name} has launched to gather intel, en route to ${target.name}. Mission target is ${recon.distance.toFixed(2)}km away in a ${aircraft.organization.name} controlled region.`,
				position: 'offense'							// Designates this aircraft as the offense or defense
			});

			const patrolCheck = await checkPatrol(recon.target, atkReport, aircraft);
			if (patrolCheck.continue === true) {
				atkReport.report = `${atkReport.report} ${aircraft.name} safely gathered information on ${target.name} and safely returned to base.`;
				missionDebugger(
					`${aircraft.name} safely gathered information on ${target.name}`
				);

				// eslint-disable-next-line no-unused-vars
				const roll = d6();

				atkReport = atkReport.createTimestamp(atkReport);
				await atkReport.save();

				await aircraft.recall();
				return;
			}
		}
	}
}

async function runDiversions() {
	for await (const mission of diversionMissions.sort((a, b) => a.distance - b.distance)) {
		missionDebugger(`Running diversion for ${mission.aircraft.name}`);
		count++; // Count iteration for each mission
		const missionCode = randCode(5); // Generates a unique code for this recon mission

		const aircraft = await Aircraft.findById(mission.aircraft)
			.populate('organization', 'name')
			.populate('upgrades')
			.populate('origin')
			.populate('team');

		const target = await Site.findById(mission.target); // Loading Site that the rdiversion is heading to.

		let atkReport = new AirMission({
			type: 'Diversion', 							// Records the After Action Report Type
			code: missionCode, 							// Unique code for this encounter
			mission: mission.mission,			// Mission type from the attacking unit
			team: aircraft.team._id,						// Team of the attacking unit
			organization: aircraft.organization._id,	// Organization the mission is taking place over
			zone: aircraft.zone._id,				// Zone the mission is in
			site: aircraft.site._id,				// Site the mission is over
			aircraft: aircraft._id,
			unit: aircraft.toObject(),				// ID of the aircraft this report is for
			report: `${aircraft.name} has launched to gather intel, en route to ${target.name}. Mission target is ${mission.distance.toFixed(2)}km away in a ${aircraft.organization.name} controlled region.`,
			position: 'offense'							// Designates this aircraft as the offense or defense
		});

		const patrolCheck = await checkPatrol(mission.target, atkReport, aircraft);
		if (patrolCheck.continue === true) {

			atkReport.report = `${atkReport.report} ${aircraft.name} distracted over target site without interference.`;

			atkReport = atkReport.createTimestamp(atkReport);
			await atkReport.save();

			await aircraft.recall();
		}
		else {
			// Add terror for non-intercepted alien craft, possibly a news report
			// if (aircraft.team.type === 'Alien') terror.alienActivity(aircraft.organization._id);
		}

		await aircraft.recall();
		return;
	}
}

// Check for all patrol missions for any that are guarding target target (Site)
async function checkPatrol(target, defReport, aircraft) {
	for await (const patrol of patrolMissions) {
		missionDebugger('Checking patrol missions...');
		if (target.toHexString() === patrol.target.toHexString()) {
			count++; // Count iteration for each mission
			const missionCode = randCode(5); // Generates a unique code for this recon mission
			// toHexString allows checking equality for _id
			missionDebugger('Patrol engaging!');

			target = await Aircraft.findById(patrol.aircraft).populate('site');
			patrolMissions.splice(patrolMissions.indexOf(patrol), 1);

			const atkReport = new AirMission({
				type: 'Interception', 					// Records the After Action Report Type
				code: missionCode, 							// Unique code for this encounter
				mission: 'Patrol',							// Mission type from the attacking unit
				team: target.team,						// Team of the attacking unit
				organization: target.organization._id,	// Organization the mission is taking place over
				zone: target.zone._id,				// Zone the mission is in
				site: target.site._id,				// Site the mission is over
				aircraft: target._id,					// ID of the aircraft this report is for
				report: `${target.name} en route ${target.site.name} airspace on mission ${missionCode}. Patrol target is ${patrol.distance.toFixed(2)}km away. Establishing patrol pattern ${randCode(3)}. Unknown approaching patrol target, ${target.name} breaking off from patrol to engage ${aircraft.type}.`,
				position: 'offense'							// Designates this aircraft as the offense or defense
			});

			defReport.report = `${defReport.report} Patrol sited over target site, prepearing to be engaged by incoming ${target.type}.`;
			defReport.position = 'defense';

			const escortCheck = await checkEscort(aircraft._id, defReport, atkReport); // Checking to see if the mission ship has a Escort;

			if (aircraft._id.toHexString() === escortCheck.target._id.toHexString()) {
				await intercept(target, atkReport, escortCheck.target, escortCheck.defReport);
				return { continue: false };
			}
			else {
				defReport.report = `${defReport.report} Escort has broken off to engage patrol.`;
				await intercept(target, atkReport, escortCheck.target, escortCheck.defReport);
				return { continue: true, defReport };
			}
		}
	}
	return { continue: true };
}

// Check for all escort missions for any that are guarding (Aircraft)
async function checkEscort(target, defReport, atkReport) {

	// Checks all remaining escort missions sorted by distance
	for await (const escort of escortMissions.sort((a, b) => a.distance - b.distance)) {
		missionDebugger('Checking escort missions...');

		// Checks if the original target is the escorts target | toHexString allows checking equality for _id
		if (target.toHexString() === escort.target.toHexString()) {
			count++; // Count iteration for each mission
			const missionCode = randCode(5); // Generates a unique code for this recon mission
			missionDebugger('Escort engaging!');
			target = await Aircraft.findById(target); // Gets the original target of the interception

			const newTarget = await Aircraft.findById(escort.aircraft)
				.populate('organization', 'name')
				.populate('upgrades')
				.populate('team')
				.populate('site'); // Gets the escorter for the target
			escortMissions.splice(escortMissions.indexOf(escort), 1); // Removes the current escort from the missions array

			// Saves the old units aar if there is one
			if (defReport) {
				defReport.report = `${defReport.report} Our escort is intercepting incoming units!`;
				defReport = await defReport.createTimestamp(defReport);
				await defReport.save();
			}

			// Creates a new report for the defensive escort engaging the attackerr
			defReport = new AirMission({
				type: 'Interception',
				code: missionCode,
				mission: 'Escort',
				team: target.team,
				organization: atkReport.organization,
				zone: atkReport.zone,
				site: atkReport.site,
				aircraft: target._id,
				report: `${newTarget.name} escorting ${target.name} to ${newTarget.organization.name} airspace on mission ${missionCode}. Desination is ${escort.distance.toFixed(2)}km away. Patrol sited over target site, prepearing to be engaged by ${target.type}. ${dynReport.escortDesc(newTarget, target)}`,
				position: 'defense'
			});

			target = newTarget; // Assigns the escort as the new target of the interception

			return { target, defReport }; // Returns to the mission for interception.
		}
	}

	target = await Aircraft.findById(target).populate('organization'); // Loads original target in for interception
	defReport = new AirMission({
		type: 'Interception',
		code: atkReport.missionCode,
		mission: target.mission,
		team: target.team,
		organization: atkReport.organization,
		zone: atkReport.zone,
		site: atkReport.site,
		aircraft: target._id,
		report: `${target.name} was engaged over ${target.organization.name} airspace.`, // Possible dynReport point
		position: 'defense'
	});
	return { target, defReport }; // Returns to mission function that called it
}

async function clearMissions() {
	for (const aircraft of await Aircraft.find({ 'status': 'deployed' })) {
		await aircraft.recall();
	}

	// TODO: this coding logic needs to be verified
	for (const aircraft of await Aircraft.find({ 'status': '-action' })) {
		await addArrayValue(aircraft.status, 'action');
		await aircraft.save();
	}
	for (const aircraft of await Aircraft.find({ 'status': '-mission' })) {
		await addArrayValue(aircraft.status, 'mission');
		await aircraft.save();
	}

	interceptionMissions = []; // Attempted Interception missions for the round
	escortMissions = []; // Attempted Escort missions for the round
	patrolMissions = []; // Attempted Patrol missions for the round
	transportMissions = []; // Attempted Transport missions for the round
	reconMissions = []; // Attempted Recon missions for the round
	diversionMissions = []; // Attempted Diversion missions for the round

	return 0;
}

module.exports = { start, resolveMissions, clearMissions };
