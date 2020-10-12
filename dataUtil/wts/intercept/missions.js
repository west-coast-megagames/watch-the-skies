const missionDebugger = require('debug')('app:missions - air');
const nexusEvent = require('../../startup/events');
const { intercept } = require('./intercept');
const { d6 } = require('../../systems/dice');
const terror = require('../terror/terror');

const { Aircraft } = require('../../models/aircraft');
const { Site } = require('../../models/site');

const { ReconReport } = require('../reports/reportClasses');

let interceptionMissions = []; // Attempted Interception missions for the round
let escortMissions = []; // Attempted Escort missions for the round
let patrolMissions = []; // Attempted Patrol missions for the round
let transportMissions = []; // Attempted Transport missions for the round
let reconMissions = []; // Attempted Recon missions for the round
let diversionMissions = []; // Attempted Diversion missions for the round

let count = 0; // Mission Counter.
// const totalCount = 0;

// Start function | loads in an aircraft & target as well as the mission type and saves them for resolution
async function start (aircraft, target, mission) {
	let newIntercept = [];
	let newEscort = [];
	let newPatrol = [];
	let newTransport = [];
	let newRecon = [];
	let newDiversion = [];
	let result = `Plan for ${mission.toLowerCase()} mission by ${
		aircraft.name
	} submitted.`;
	aircraft = aircraft._id; // Saves just the _ID of the aircraft
	target = target._id; // Saves just the _ID of the target

	// SWITCH Sorts the mission into the correct mission array
	switch (true) {
	case mission === 'Interception':
		newIntercept = [{ aircraft, target }]; // Saves the Intercept combination
		interceptionMissions = [...interceptionMissions, ...newIntercept]; // Adds Interception to be resolved
		missionDebugger(interceptionMissions);
		break;
	case mission === 'Escort':
		newEscort = [{ aircraft, target }]; // Saves the Escort combination
		escortMissions = [...escortMissions, ...newEscort]; // Adds Escort to be resolved
		missionDebugger(escortMissions);
		break;
	case mission === 'Patrol':
		newPatrol = [{ aircraft, target }]; // Saves the Patrol combination
		patrolMissions = [...patrolMissions, ...newPatrol]; // Adds Patrol to be resolved
		missionDebugger(patrolMissions);
		break;
	case mission === 'Transport':
		newTransport = [{ aircraft, target }]; // Saves the Transport combination
		transportMissions = [...transportMissions, ...newTransport]; // Adds Transport to be resolved
		missionDebugger(transportMissions);
		break;
	case mission === 'Recon Site' || mission === 'Recon Airship':
		newRecon = [{ aircraft, target }]; // Saves the Recon combination
		reconMissions = [...reconMissions, ...newRecon]; // Adds Recon to be resolved
		missionDebugger(reconMissions);
		break;
	case mission === 'Diversion':
		newDiversion = [{ aircraft, target }]; // Saves the Recon combination
		diversionMissions = [...diversionMissions, ...newDiversion]; // Adds Recon to be resolved
		missionDebugger(diversionMissions);
		break;
	default:
		result = `${result} This is not an acceptable mission type.`;
	}

	missionDebugger(`${result}`);

	return;
}

// Function for resolving missions when the Team Phase ends.
async function resolveMissions () {
	missionDebugger('Resolving Missions...');

	await runInterceptions();
	await runTransports();
	await runRecon();
	await runDiversions();
	await clearMissions();

	missionDebugger(`Mission resolution complete. Mission Count: ${count}`);
	// totalCount += count;
	count = 0;
	nexusEvent.emit('updateAircrafts');

	return 0;
}

// Iterate over all submitted Interceptions
async function runInterceptions () {
	for await (const interception of interceptionMissions) {
		count++; // Count iteration for each interception
		missionDebugger(`Mission #${count} - Intercept Mission`);
		const stance = 'passive'; // Targets stance for interception defaults to 'passive'
		const aircraft = await Aircraft.findById(interception.aircraft)
			.populate('country', 'name')
			.populate('systems');

		if (aircraft.status.destroyed || aircraft.systems.length < 1) {
			console.log(`DEAD Aircraft Flying: ${aircraft.name}`);
			continue;
		}

		let target = await Aircraft.findById(interception.target).populate(
			'systems'
		);
		missionDebugger(`${aircraft.name} vs. ${target.name}`);
		let atkReport = `${aircraft.name} is attempting to engage a contact in ${aircraft.country.name} airspace.`;

		const escortCheck = await checkEscort(interception.target, atkReport);

		target = escortCheck.target;
		atkReport = escortCheck.atkReport;
		const defReport = escortCheck.defReport;

		if (target.status.destroyed || target.systems.length < 1) {
			atkReport = `${atkReport} Target has been shot down prior to engagement.`;
			missionDebugger(atkReport);
			// Intercept Report

			continue;
		}

		missionDebugger(`${aircraft.name} is engaging ${target.name}.`);
		atkReport = `${atkReport} ${aircraft.name} engaged ${target.type}.`;
		await intercept(
			aircraft,
			'aggresive',
			atkReport,
			target,
			stance,
			defReport
		);
	}
	return 0;
}

// Iterate over all remaining transport missions
async function runTransports () {
	for await (const transport of transportMissions) {
		count++; // Count iteration for each mission
		missionDebugger(`Mission #${count} - Transport Mission`);
		const aircraft = await Aircraft.findById(transport.aircraft)
			.populate('country', 'name')
			.populate('systems');

		if (aircraft.status.destroyed || aircraft.systems.length < 1) {
			console.log(`DEAD Aircraft Flying: ${aircraft.name}`);
			continue;
		}

		const target = await Site.findById(transport.target); // Loading Site that the transport is heading to.
		missionDebugger(`${aircraft.name} transporting cargo to ${target.name}`);
		let atkReport = `${aircraft.name} hauling cargo through ${aircraft.country.name} airspace from ${target.name}`;

		const patrolCheck = await checkPatrol(transport.target, atkReport, aircraft);

		if (patrolCheck.continue === true) {
			atkReport = `${atkReport} ${aircraft.name} arrived safely at ${target.name}.`;
			missionDebugger(`${aircraft.name} arrived safely at ${target.name}`);
			// Make a mission log
			// Schedule a ground mission.

			aircraft.mission = 'Docked';
			aircraft.status.ready = true;
			aircraft.status.deployed = false;
			aircraft.country = aircraft.origin.country;
			aircraft.site = aircraft.origin._id;
			aircraft.zone = aircraft.origin.zone;

			await aircraft.save();
		}
	}

	return;
}

// Iterate over all remaining Recon missions - DONE [NOT TESTED]
async function runRecon () {
	for await (const recon of reconMissions) {
		const MissionReport = new ReconReport();
		count++; // Count iteration for each mission
		missionDebugger(`Mission #${count} - Recon Mission`);
		const aircraft = await Aircraft.findById(recon.aircraft)
			.populate('country', 'name')
			.populate('systems')
			.populate('origin');
		let atkReport = `${aircraft.name} conducting surveillance in ${aircraft.country.name}.`;
		if (aircraft.mission === 'Recon Aircraft') {
			let target = await Aircraft.findById(recon.target); // Loading Aircraft that the recon is heading to.

			if (target.status.destroyed || target.systems.length < 1) {
				atkReport = `${atkReport} Target has been shot down prior to recon.`;
				console.log(atkReport);
				// Recon Report

				continue;
			}

			const escortCheck = await checkEscort(recon.target, atkReport);

			target = escortCheck.target;
			atkReport = escortCheck.atkReport;

			// Check if we are still doing a recon mission or being intercepted.
			if (target.toHexString() === recon.target.toHexString()) {
				// toHexString allows checking equality for _id
				atkReport = `${atkReport} ${aircraft.name} safely gathered information on ${target.type} and safely returned to base.`;
				const roll = d6();

				MissionReport.team = aircraft.team._id;
				MissionReport.unit = aircraft._id;
				MissionReport.targetAircraft = target._id;
				MissionReport.report = atkReport;
				MissionReport.country = aircraft.country._id;
				MissionReport.zone = aircraft.zone._id;
				MissionReport.rolls.push(roll);
				MissionReport.date = Date.now();

				MissionReport.saveReport();

				console.log(aircraft);

				aircraft.mission = 'Docked';
				aircraft.status.ready = true;
				aircraft.status.deployed = false;
				aircraft.country = aircraft.origin.country;
				aircraft.site = aircraft.origin._id;
				aircraft.zone = aircraft.origin.zone;

				await aircraft.save();

				return;
			}
			else {
				const defReport = escortCheck.defReport;

				missionDebugger(`${aircraft.name} is engaging ${target.name}.`);
				atkReport = `${atkReport} ${aircraft.name} engaged ${target.type}.`;
				const stance = undefined;
				await intercept(
					aircraft,
					'aggresive',
					atkReport,
					target,
					stance,
					defReport
				);

				return 0;
			}
		}
		else if (aircraft.mission === 'Recon Site') {
			const patrolCheck = await checkPatrol(recon.target, atkReport, aircraft);
			const target = await Site.findById(recon.target); // Loading Aircraft that the recon is heading to.
			if (patrolCheck === 'continue') {
				atkReport = `${atkReport} ${aircraft.name} safely gathered information on ${target.name} and safely returned to base.`;
				missionDebugger(
					`${aircraft.name} safely gathered information on ${target.name}`
				);
				const roll = d6();

				MissionReport.team = aircraft.team._id;
				MissionReport.unit = aircraft._id;
				MissionReport.targetSite = target._id;
				MissionReport.country = aircraft.country._id;
				MissionReport.zone = aircraft.zone._id;
				MissionReport.report = atkReport;
				MissionReport.rolls.push(roll);
				MissionReport.date = Date.now();

				MissionReport.saveReport();

				console.log(aircraft);
				aircraft.mission = 'Docked';
				aircraft.status.ready = true;
				aircraft.status.deployed = false;
				aircraft.country = aircraft.origin.country;
				aircraft.site = aircraft.origin._id;
				aircraft.zone = aircraft.origin.zone;

				await aircraft.save();

				return;
			}
		}
	}
}

async function runDiversions () {
	for await (const mission of diversionMissions) {
		missionDebugger(`Running diversion for ${mission.aircraft.name}`);
		const aircraft = await Aircraft.findById(mission.aircraft)
			.populate('country', 'name')
			.populate('systems')
			.populate('origin')
			.populate('team');
		if (aircraft.team.type === 'Alien') terror.alienActivity(aircraft.country._id);

		// Diversion mission log

		aircraft.mission = 'Docked';
		aircraft.status.ready = true;
		aircraft.status.deployed = false;
		aircraft.country = aircraft.origin.country;
		aircraft.site = aircraft.origin._id;
		aircraft.zone = aircraft.origin.zone;

		await aircraft.save();
	}
}

// Check for all patrol missions for any that are guarding transport target (Site)
async function checkPatrol (target, atkReport, aircraft) {
	for (const patrol of patrolMissions) {
		missionDebugger('Checking patrol missions...');
		if (target.toHexString() === patrol.target.toHexString()) {
			// toHexString allows checking equality for _id
			missionDebugger('Patrol engaging!');

			target = await Aircraft.findById(patrol.aircraft).populate('systems');
			patrolMissions.splice(patrolMissions.indexOf(patrol), 1);

			let defReport = `${target.name} breaking off from patrol to engage ${aircraft.type}.`;
			atkReport = `${atkReport} patrol sited over target site, being engaged by ${target.type}.`;

			const escortCheck = checkEscort(aircraft._id, defReport); // Checking to see if the mission ship has a Escort;

			if (aircraft._id.toHexString() === escortCheck.target.toHexString()) {
				defReport = escortCheck.atkReport;
				const escortReport = `${atkReport} ${escortCheck.defReport}`;
				await intercept(
					escortReport.target,
					'aggresive',
					escortReport,
					target,
					'aggresive',
					defReport
				);
				atkReport = `${atkReport} Escort has broken off to engage patrol.`;
			}
			else {
				await intercept(
					aircraft,
					'passive',
					atkReport,
					target,
					'aggresive',
					defReport
				);
				return { continue: false };
			}
		}
	}
	return { continue: true, atkReport };
}

// Check for all escort missions for any that are guarding (Aircraft)
async function checkEscort (target, atkReport) {
	for (const escort of escortMissions) {
		missionDebugger('Checking escort missions...');
		// let stance = '';
		if (target.toHexString() === escort.target.toHexString()) {
			// toHexString allows checking equality for _id
			missionDebugger('Escort engaging!');
			target = await Aircraft.findById(target);
			const newTarget = await Aircraft.findById(escort.aircraft).populate(
				'systems'
			);
			escortMissions.splice(escortMissions.indexOf(escort), 1);
			// stance = 'aggresive';
			const defReport = `${newTarget.name} broke away from ${target.name} to engage incoming aircraft.`;
			atkReport = `${atkReport} Contact seems to have an escort, escort is breaking off to engage.`;
			target = newTarget;
			return { target, atkReport, defReport };
		}
	}
	target = await Aircraft.findById(target)
		.populate('systems')
		.populate('country');
	const defReport = `${target.name} was engaged over ${target.country.name} airspace.`;
	return { target, atkReport, defReport };
}

function clearMissions () {
	interceptionMissions = []; // Attempted Interception missions for the round
	escortMissions = []; // Attempted Escort missions for the round
	patrolMissions = []; // Attempted Patrol missions for the round
	transportMissions = []; // Attempted Transport missions for the round
	reconMissions = []; // Attempted Recon missions for the round
	diversionMissions = []; // Attempted Diversion missions for the round

	return 0;
}

module.exports = { start, resolveMissions, clearMissions };
