const { Aircraft } = require('../../models/ops/aircraft');
const { Facility } = require('../../models/gov/facility/facility');
const nexusEvent = require('../../startup/events');
const { RepairReport } = require('../reports/reportClasses');
const Debugger = require('debug')('app:construction:repair');

async function repairSequence () {
    for await (let aircraft of await Aircraft.find({'status.repair': true})) {
        if (aircraft.status.repair) {
            Debugger(`${aircraft.name} is being repaired...`);
            let report = new RepairReport;
            report.logType = 'Aircraft Repair'
            report.dmgRepaired = aircraft.stats.hullMax - aircraft.stats.hull;
            aircraft.stats.hull = aircraft.stats.hullMax;
            aircraft.status.damaged = false;
            aircraft.status.ready = true;
            aircraft.status.repair = false;
            aircraft.mission = 'Ready'

            await aircraft.save();
            
            report.team = aircraft.team;
            report.aircraft = aircraft._id;
            report.cost = 2;
            await report.saveReport();
        }
    }
    for (let structure of await Facility.find({'status.repair': true})) {
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