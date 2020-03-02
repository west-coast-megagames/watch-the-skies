let { Aircraft } =  require('../../models/ops/aircraft');
const nexusEvent = require('../../startup/events');
const Debugger = require('debug')('app:construction:repair');

async function repairSequence () {
    for (let aircraft of await Aircraft.find()) {
        if (aircraft.status.repair) {
            Debugger(`${aircraft.name} is being repaired...`);
            aircraft.stats.hull = aircraft.stats.hullMax;
            aircraft.status.damaged = false;
            aircraft.status.ready = true;
            aircraft.status.repair = false;
            aircraft.mission = 'Ready'

            await aircraft.save();
            nexusEvent.emit('updateAircraft');

        }

    }
}

module.exports = repairSequence;