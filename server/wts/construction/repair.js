const { Aircraft } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const nexusEvent = require('../../middleware/events/events');
const { RepairReport } = require('../reports/reportClasses');
const Debugger = require('debug')('app:construction:repair');

async function repairSequence () {
	for await (const aircraft of await Aircraft.find({ 'status.repair': true })) {
		if (aircraft.status.repair) {
			Debugger(`${aircraft.name} is being repaired...`);
			const report = new RepairReport;
			report.type = 'Aircraft Repair';
			report.dmgRepaired = aircraft.stats.hullMax - aircraft.stats.hull;
			aircraft.stats.hull = aircraft.stats.hullMax;
			aircraft.status.damaged = false;
			aircraft.status.ready = true;
			aircraft.status.repair = false;
			aircraft.mission = 'Ready';

			await aircraft.save();

			report.team = aircraft.team._id;
			report.aircraft = aircraft._id;
			report.cost = 2;
			await report.saveReport();
		}
	}
	for await (const structure of await Facility.find({ 'status.repair': true })) {
		if (structure.status.repair) {
			structure.status.repair = false;
			structure.save();
			Debugger(`${structure.name} is being repaired...`);
		}
	}
	nexusEvent.emit('updateAircrafts');
	nexusEvent.emit('updateLogs');
}

module.exports = repairSequence;