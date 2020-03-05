const fs = require('fs')
const config = require('config');

const file = fs.readFileSync(require.resolve(config.get('initPathWTS') + 'json/facilities/facilities.json'));
const facilData = JSON.parse(file);

facilityDebugger = require('debug')('app:facility');

const facilitys = []

const { Facility, Lab, Hanger, Factory, Crisis, Civilian } = require('../../../models/gov/facility/facility');

// Load function to load all facilitys
async function loadFacilitys () {
    let count = 0;

    await facilData.forEach(facil => {
        facilityDebugger(facil);
        facilitys[count] = new Facil(facil);
        count++;
    });

    return `${count} Facility Templates availible in WTS...`
};

// Facility Template Constructor Function
function Facil(facil) {
    this.name = facil.name;
    this.type = facil.type;
    this.cost = facil.cost;
    this.prereq = facil.prereq;
    this.desc = facil.desc;
    this.status = facil.status;
    this.code  = facil.code;
    this.unitType = facil.unitType;
    this.buildTime = facil.buildTime;
    this.hidden    = facil.hidden;
    if (facil.type === "Lab") {
      this.sciRate   = facil.sciRate;
      this.funding   = facil.funding;
      this.bonus     = facil.bonus;
    }

    this.build = async function() {
        let newFacil = new Facility(this)

        await newFacil.save();

        console.log(`${newFacil.name} has been built...`)

        return newFacil;
    }
}

// determines if facility is valid for passed unitType (i.e., is it in the unitType array)
function validUnitType(unitTypeArray, testUT) {
    let utFound = false;
    chkLoop:
    for (var i = 0; i < unitTypeArray.length; i++) {
      if (unitTypeArray[i] === "Any") {
        utFound = true;    
        break chkLoop; 
      } else if (unitTypeArray[i] === testUT) {
        utFound = true;  
        break chkLoop;
      }
    }
    return utFound;
}

module.exports = { loadFacilitys, facilitys, validUnitType };