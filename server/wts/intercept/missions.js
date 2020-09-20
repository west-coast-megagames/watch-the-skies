const missionDebugger = require("debug")("app:missions - air");
const nexusEvent = require("../../startup/events");
const { intercept } = require("./intercept");
const { d6 } = require("../../util/systems/dice");
const terror = require("../terror/terror");

const { Aircraft } = require("../../models/ops/aircraft");
const { Facility } = require("../../models/gov/facility/facility");
const { Site } = require("../../models/sites/site");

const { ReconReport, TransportReport, } = require("../reports/reportClasses");
const { getDistance } = require("../../util/systems/geo");
const { makeAfterActionReport } = require("./report");
const dynReport = require("./battleDetails");
const { logger } = require("../../middleware/winston");


let interceptionMissions = []; // Attempted Interception missions for the round
let escortMissions = []; // Attempted Escort missions for the round
let patrolMissions = []; // Attempted Patrol missions for the round
let transportMissions = []; // Attempted Transport missions for the round
let reconMissions = []; // Attempted Recon missions for the round
let diversionMissions = []; // Attempted Diversion missions for the round
let transferMissions = []; // Attempted Transfer missions for the round

let count = 0; // Mission Counter.
let totalCount = 0;

// Start function | loads in an aircraft & target as well as the mission type and saves them for resolution
async function start(aircraft, target, mission) {
  let result = `Plan for ${mission.toLowerCase()} mission by ${aircraft.name} submitted.`;
  let origin = await Facility.findById(aircraft.origin).populate('site'); // Populate home facility for the aircraft

  let targetGeo = undefined // Initiate targets Geo position placeholder
  target.model === 'Aircraft' || 'Facility' ? targetGeo = target.site.geoDecimal : targetGeo = target.geoDecimal; // Assign targets geo position
  let { latDecimal, longDecimal } = origin.site.geoDecimal; // Destructure aircrafts launch position
  
  aircraft = aircraft._id; // Saves just the _ID of the aircraft
  target = target._id; // Saves just the _ID of the target
   
  missionDebugger(targetGeo)
  missionDebugger(origin.site.geoDecimal)
  let distance = getDistance(latDecimal, longDecimal, targetGeo.latDecimal, targetGeo.longDecimal); // Get distance to target in KM
  missionDebugger(`Mission distance ${distance}km`);

  // SWITCH Sorts the mission into the correct mission 
  let newMission = [{ aircraft, target, distance, origin }]; // Saves the mission combination
  switch (true) {
    case mission === "Interception":
      interceptionMissions = [...interceptionMissions, ...newMission]; // Adds Interception to be resolved
      missionDebugger(interceptionMissions);
      break;
    case mission === "Escort":
      escortMissions = [...escortMissions, ...newMission]; // Adds Escort to be resolved
      missionDebugger(escortMissions);
      break;
    case mission === "Patrol":
      patrolMissions = [...patrolMissions, ...newMission]; // Adds Patrol to be resolved
      missionDebugger(patrolMissions);
      break;
    case mission === "Transport":
      transportMissions = [...transportMissions, ...newMission]; // Adds Transport to be resolved
      missionDebugger(transportMissions);
      break;
    case mission === "Recon Site" || mission === "Recon Airship":
      reconMissions = [...reconMissions, ...newMission]; // Adds Recon to be resolved
      missionDebugger(reconMissions);
      break;
    case mission === "Diversion":
      diversionMissions = [...diversionMissions, ...newMission]; // Adds Recon to be resolved
      missionDebugger(diversionMissions);
      break;
    case mission === "Transfer":
      transferMissions.push(newMission);
      missionDebugger(transferMissions);
      break;
    default:
      result = `${result} This is not an acceptable mission type.`;
      logger.error(`Invalid Air Mission: ${mission} is not a valid mission type.`)
  }

  missionDebugger(interceptionMissions.sort((a,b) => a.distance - b.distance));
  missionDebugger(`${result}`);

  return;
}

// Function for resolving missions when the Team Phase ends.
async function resolveMissions() {
  missionDebugger("Resolving Missions...");

  await runInterceptions(); // Runs through all Inteceptions | Checks for escorts
  await runTransports();
  await runRecon();
  await runDiversions();
  await resolveTransfers();
  await clearMissions();

  missionDebugger(`Mission resolution complete. Mission Count: ${count}`);
  totalCount += count;
  count = 0;
  nexusEvent.emit("updateAircrafts");
  nexusEvent.emit("updateLogs");

  return 0;
}

// Iterate over all submitted Interceptions in range order
async function runInterceptions() {
  for await (let interception of interceptionMissions.sort((a,b) => a.distance - b.distance)) {
    count++; // Count iteration for each interception
    missionDebugger(`Mission #${count} - Intercept Mission`);

    let stance = "passive"; // Target stance for interception defaults to 'passive'
    let aircraft = await Aircraft.findById(interception.aircraft).populate("country", "name").populate("systems"); // Gets the Initiator from the DB
    let atkReport = `${aircraft.name} en route to ${aircraft.country.name} airspace. Projected target intercept is ${interception.distance}km away. ${aircraft.name} attempting to engage a contact.`; // Starts narrative report

    // Skips mission if the current aircraft is dead
    if (aircraft.status.destroyed || aircraft.systems.length < 1) {
      missionDebugger(`DEAD Aircraft Flying: ${aircraft.name}`);
      continue;
    }

    let target = await Aircraft.findById(interception.target).populate("systems"); // Gets the Target from the DB
    missionDebugger(`${aircraft.name} vs. ${target.name}`);


    let escortCheck = await checkEscort(interception.target, atkReport, aircraft); // Checks to see if the target is escorted

    target = escortCheck.target;
    atkReport = escortCheck.atkReport;
    defReport = escortCheck.defReport;
    stance = escortCheck.stance;

    if (target.status.destroyed || target.systems.length < 1) {
      let log = {
        logType: 'Failure',
        team: aircraft.team,
        position: 'Offense',
        country: aircraft.country._id,
        zone: aircraft.zone._id,
        site: aircraft.site._id,
        report: `${atkReport} ${aircraft.name} was unable to find mission target.`,
        unit: aircraft._id,
        opponent: target._id
      };
      await makeAfterActionReport(log);
      // TODO return attacker to base
      missionDebugger(atkReport);
      continue;
    }

    missionDebugger(`${aircraft.name} is engaging ${target.name}.`);
    atkReport = `${atkReport} ${dynReport.engageDesc(aircraft, aircraft.country )}`;
    await intercept( aircraft, "aggresive", atkReport, target, stance, defReport );
  }
  return 0;
}

// Iterate over all remaining transport missions
async function runTransports() {
  for await (let transport of transportMissions.sort((a,b) => a.distance - b.distance)) {
    count++; // Count iteration for each mission
    missionDebugger(`Mission #${count} - Transport Mission`);
    
    let report = new TransportReport();

    
    let aircraft = await Aircraft.findById(transport.aircraft).populate("country", "name").populate("systems");

    if (aircraft.status.destroyed || aircraft.systems.length < 1) {
      console.log(`DEAD Aircraft Flying: ${aircraft.name}`);
      continue;
    }

    let target = await Site.findById(transport.target); // Loading Site that the transport is heading to.
    missionDebugger(`${aircraft.name} transporting cargo to ${target.name}`);
    let atkReport = `${aircraft.name} has launched for a hauling run, en route to ${target.name}. Mission target is in a ${aircraft.country.name} controlled region.`;

    let patrolCheck = await checkPatrol(transport.target, atkReport, aircraft);

    if (patrolCheck.continue === true) {
      atkReport = `${atkReport} ${aircraft.name} arrived safely at ${target.name}.`;
      missionDebugger(`${aircraft.name} arrived safely at ${target.name}`);

      report.team = aircraft.team._id;
      report.unit = aircraft._id;
      report.site = aircraft.site;
      report.country = aircraft.country;
      report.zone = aircraft.zone;
      await report.save();

      // Schedule a ground mission.

      await aircraft.returnToBase(aircraft);
    }
  }

  return;
}

// Iterate over all remaining Recon missions - DONE [NOT TESTED]
async function runRecon() {
  for await (let recon of reconMissions.sort((a,b) => a.distance - b.distance)) {
    let MissionReport = new ReconReport();
    count++; // Count iteration for each mission
    missionDebugger(`Mission #${count} - Recon Mission`);
    let aircraft = await Aircraft.findById(recon.aircraft)
      .populate("country", "name")
      .populate("systems")
      .populate("origin");
    let atkReport = `${aircraft.name} conducting surveillance in ${aircraft.country.name}.`;
    
    if (aircraft.mission === "Recon Aircraft") {
      let target = await Aircraft.findById(recon.target); // Loading Aircraft that the recon is heading to.

      if (target.status.destroyed || target.systems.length < 1) {
        atkReport = `${atkReport} Target has been shot down prior to recon.`;
        console.log(atkReport);

        continue;
      }

      let escortCheck = await checkEscort(recon.target, atkReport);

      target = escortCheck.target;
      atkReport = escortCheck.atkReport;

      // Check if we are still doing a recon mission or being intercepted.
      if (target.toHexString() === recon.target.toHexString()) {
        // toHexString allows checking equality for _id
        atkReport = `${atkReport} ${aircraft.name} safely gathered information on ${target.type} and safely returned to base.`;
        let roll = d6();

        //Generate Intel

        MissionReport.team = aircraft.team._id;
        MissionReport.unit = aircraft._id;
        MissionReport.targetAircraft = target._id;
        MissionReport.report = atkReport;
        MissionReport.country = aircraft.country._id;
        MissionReport.zone = aircraft.zone._id;
        MissionReport.rolls.push(roll);
        MissionReport.date = Date.now();

        MissionReport.saveReport();

        await aircraft.returnToBase(aircraft);
        return;
      } else {
        defReport = escortCheck.defReport;

        missionDebugger(`${aircraft.name} is engaging ${target.name}.`);
        atkReport = `${atkReport} ${aircraft.name} engaged ${target.type}.`;
        await intercept(
          aircraft,
          "passive",
          atkReport,
          target,
          stance,
          defReport
        );

        return 0;
      }
    }
    
    if (aircraft.mission === "Recon Site") {
      let patrolCheck = await checkPatrol(recon.target, atkReport, aircraft);
      let target = await Site.findById(recon.target); // Loading Aircraft that the recon is heading to.
      if (patrolCheck.continue === true) {
        atkReport = `${atkReport} ${aircraft.name} safely gathered information on ${target.name} and safely returned to base.`;
        missionDebugger(
          `${aircraft.name} safely gathered information on ${target.name}`
        );
        let roll = d6();

        MissionReport.team = aircraft.team._id;
        MissionReport.unit = aircraft._id;
        MissionReport.targetSite = target._id;
        MissionReport.country = aircraft.country._id;
        MissionReport.zone = aircraft.zone._id;
        MissionReport.report = atkReport;
        MissionReport.rolls.push(roll);
        MissionReport.date = Date.now();

        MissionReport.saveReport();

        await aircraft.returnToBase(aircraft);
        return;
      }
    }
  }
}

async function runDiversions() {
  for await (let mission of diversionMissions.sort((a,b) => a.distance - b.distance)) {
    missionDebugger(`Running diversion for ${mission.aircraft.name}`);
    let aircraft = await Aircraft.findById(mission.aircraft)
      .populate("country", "name")
      .populate("systems")
      .populate("origin")
      .populate("team");
    if (team.type === "Alien") terror.alienActivity(aircraft.country._id);

    // Diversion mission log

    await aircraft.returnToBase(aircraft);
  }
}

// Check for all patrol missions for any that are guarding transport target (Site)
async function checkPatrol(target, atkReport, aircraft) {
  for (let patrol of patrolMissions) {
    missionDebugger("Checking patrol missions...");
    if (target.toHexString() === patrol.target.toHexString()) {
      // toHexString allows checking equality for _id
      missionDebugger("Patrol engaging!");

      target = await Aircraft.findById(patrol.aircraft).populate("systems");
      patrolMissions.splice(patrolMissions.indexOf(patrol), 1);

      let defReport = `${target.name} breaking off from patrol to engage ${aircraft.type}.`;
      atkReport = `${atkReport} patrol sited over target site, being engaged by ${target.type}.`;

      let escortCheck = checkEscort(aircraft_id, defReport); // Checking to see if the mission ship has a Escort;

      if (aircraft._id.toHexString() === escortCheck.target.toHexString()) {
        defReport = escortCheck.atkReport;
        let escortReport = `${atkReport} ${escortCheck.defReport}`;
        await intercept(escortReport.target, "aggresive", escortReport, target, "aggresive", defReport);
        atkReport = `${atkReport} Escort has broken off to engage patrol.`;
      } else {
        await intercept(aircraft, "passive", atkReport, target, "aggresive", defReport);
        return { continue: false };
      }
    }
  }
  return { continue: true, atkReport };
}

// Check for all escort missions for any that are guarding (Aircraft)
async function checkEscort(target, atkReport, attacker) {

  // Checks all remaining escort missions sorted by distance
  for (let escort of escortMissions.sort((a,b) => a.distance - b.distance)) {
    missionDebugger("Checking escort missions...");

    if (target.toHexString() === escort.target.toHexString()) {
      // toHexString allows checking equality for _id
      missionDebugger("Escort engaging!");
      target = await Aircraft.findById(target); // Gets the original target of the interception
      let newTarget = await Aircraft.findById(escort.aircraft).populate("systems").populate('country'); // Gets the escorter for the target
      escortMissions.splice(escortMissions.indexOf(escort), 1); // Removes the current escort from the missions array
      let stance = "aggresive"; // Sets the stance for the new target to
      let defReport = dynReport.escortDesc(newTarget, target);
      atkReport = dynReport.escortEngageDesc(attacker, atkReport);

      target = newTarget;
      return { target, atkReport, defReport, stance };
    }
  }

  target = await Aircraft.findById(target).populate("systems").populate("country"); // Loads original target in for interception
  let defReport = `${target.name} was engaged over ${target.country.name} airspace.`; // Possible dynReport point
  return { target, atkReport, defReport, stance: 'defensive' }; // Returns to mission function that called it
}

async function resolveTransfers() {
  for await (let transfer of transportMissions.sort((a,b) => a.distance - b.distance)) {
    count++; // Count iteration for each mission
    missionDebugger(`Mission #${count} - Transfer Mission`);
    
    let report = new TransportReport();
    let aircraft = await Aircraft.findById(transfer.aircraft).populate("country", "name").populate("systems");

    if (aircraft.status.destroyed || aircraft.systems.length < 1) {
      console.log(`DEAD Aircraft Flying: ${aircraft.name}`);
      continue;
    }

    let target = await Facility.findById(transfer.target); // Loading Site that the aircraft is heading to.
    missionDebugger(`${aircraft.name} transferring to ${target.name}`);
    aircraft.origin = target


    report.team = aircraft.team._id;
    report.unit = aircraft._id;
    report.site = aircraft.site;
    report.country = aircraft.country;
    report.zone = aircraft.zone;
    await report.save();    
  }

  return;
}

async function clearMissions() {
  for (let aircraft of await Aircraft.find()) {
    await aircraft.returnToBase(aircraft);
  }
  interceptionMissions = []; // Attempted Interception missions for the round
  escortMissions = []; // Attempted Escort missions for the round
  patrolMissions = []; // Attempted Patrol missions for the round
  transportMissions = []; // Attempted Transport missions for the round
  reconMissions = []; // Attempted Recon missions for the round
  diversionMissions = []; // Attempted Diversion missions for the round
  transferMissions = [];

  return 0;
}

module.exports = { start, resolveMissions, clearMissions };
