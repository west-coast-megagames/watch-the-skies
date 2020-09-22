const { Aircraft } = require("../../models/aircraft");
const { Facility } = require("../../models/facility");
const nexusEvent = require("../../startup/events");
const Debugger = require("debug")("app:construction:repair");

async function repairSequence() {
  for await (let aircraft of await Aircraft.find({ "status.repair": true })) {
    if (aircraft.status.repair) {
      Debugger(`${aircraft.name} is being repaired...`);
      aircraft.stats.hull = aircraft.stats.hullMax;
      aircraft.status.damaged = false;
      aircraft.status.ready = true;
      aircraft.status.repair = false;
      aircraft.mission = "Ready";

      await aircraft.save();
    }
  }
  nexusEvent.emit("updateAircraft");
  for (let structure of await Facility.find({ "status.repair": true })) {
    if (structure.status.repair) {
      structure.status.repair = false;
      structure.save();
      Debugger(`${structure.name} is being repaired...`);
    }
  }
}

module.exports = repairSequence;
