const fs = require('fs')
const config = require('config');

const file = fs.readFileSync(require.resolve(config.get('initPathWTS') + 'json/facilities/facilities.json'));
const facilData = JSON.parse(file);

const BlueprintFacility = require('../../models/gov/blueprints');

facilityDebugger = require('debug')('app:facility');

// Load function to load all facilitys
async function loadFacilitys () {
    let count = 0;

    await facilData.forEach(facil => {
        facilityDebugger(facil);
        facilitys[count] = new Facil(facil);
        count++;
    });

    return `${count} Facility Templates available in WTS...`
};


module.exports = { loadFacilitys,  };