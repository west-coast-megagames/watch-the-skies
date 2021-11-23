const { Aircraft } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const nexusEvent = require('../../middleware/events/events');
const { RepairReport } = require('../../models/report');
const Debugger = require('debug')('app:construction:repair');
const { clearArrayValue, addArrayValue } = require('../../middleware/util/arrayCalls');

async function repairSequence () {
	for await (const aircraft of await Aircraft.find({ 'status.repair': true })) {
		if (aircraft.status.some(el => el === 'repair')) {
			Debugger(`${aircraft.name} is being repaired...`);
			const report = new RepairReport;
			report.type = 'Aircraft Repair';
			report.dmgRepaired = aircraft.stats.hullMax - aircraft.stats.hull;
			aircraft.stats.hull = aircraft.stats.hullMax;

			await clearArrayValue(aircraft.status, 'damaged');
			await addArrayValue(aircraft.status, 'ready');
			await clearArrayValue(aircraft.status, 'repair');
			aircraft.mission = 'Ready';

			await aircraft.save();

			report.team = aircraft.team._id;
			report.aircraft = aircraft._id;
			report.cost = 2;
			await report.saveReport();
		}
	}
	for await (const structure of await Facility.find({ 'status': 'repair' })) {
		if (structure.status.some(el => el === 'repair')) {
			await clearArrayValue(structure.status, 'repair');
			structure.save();
			Debugger(`${structure.name} is being repaired...`);
		}
	}
	nexusEvent.emit('updateAircrafts');
	nexusEvent.emit('updateLogs');
}

module.exports = repairSequence;