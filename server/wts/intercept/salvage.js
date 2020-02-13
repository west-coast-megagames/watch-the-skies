const salvageDebugger = require('debug')('app:intercept - salvage');

async function generateSalvage (system, status) {
    const { Team } = require('../../models/team');
    if (status === 'Wreckage'|| system.status.damaged === true) {
        let team = await Team.findOne({ teamType: 'C' });
        system.status.salvage = true;
        system.status.team = team._id;
        salvageDebugger(`${system.name} has been turned into wreckage...`);
    } else if (status === 'Damaged' ) {
        system.status.damaged = true;
        salvageDebugger(`${system.name} has been destroyed...`)
    }
    return system;
}

module.exports = { generateSalvage }