const fs = require('fs')
const bpLoadDebugger = require('debug')('app:blueprints');
const facilityData = JSON.parse(fs.readFileSync(require.resolve('../json/facilities/facilities.json')));
//const aircraftData = JSON.parse(fs.readFileSync(require.resolve('../json/sites/aircraft_bp.json')));
//const squadData = JSON.parse(); //js dislikes empty parse functions
//const upgradeData = JSON.parse();
const blueprintsData = [...facilityData, ];//...aircraftData, ...squadData, ...upgradeData

// Import Blueprint discriminators for all buildables
// Facility | Aircraft | Spacecraft | Squad | Upgrade
const { Blueprint, FacilityBlueprint, AircraftBlueprint, SquadBlueprint, UpgradeBlueprint } = require('../../models/gov/blueprint');

// Load function to load all facilitys
async function loadBlueprints () {
    let total = 0;
    let facilityCount = 0;
    let aircraftCount = 0;
    let squadCount = 0;
    let upgradeCount = 0;

    await Blueprint.deleteMany();
    for (let bp of blueprintsData) {
        bpLoadDebugger(bp);
        let validLoad = true;
        switch (bp.model) {
            case ('facility'):
                bp = new FacilityBlueprint(bp);
                bp = await bp.save();
                facilityCount++
                break;
            case ('aircraft'):
                bp = await new AircraftBlueprint(bp);
                bp = await bp.save();
                aircraftCount++
                break;
            case ('squad'):
                bp = await new SquadBlueprint(bp)
                squadCount++
                break;
            case ('upgrade'):
                bp = await new UpgradeBlueprint(bp)
                upgradeCount++
                break;
            default:
                bpLoadDebugger('Not a valud blueprint');
                validLoad = false;
        }
        if (validLoad) total++
    }
    return `${total} Bluprints available in WTS | ${facilityCount} Faclities | ${aircraftCount} Aircrafts | ${squadCount} Squads | ${upgradeCount} upgrades`
};

//
module.exports = { loadBlueprints };