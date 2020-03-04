const fs = require('fs')
const config = require('config');

const file = fs.readFileSync(require.resolve(config.get('initPathWTS') + 'json/equipment/systems.json'));
const systemData = JSON.parse(file);

systemsDebugger = require('debug')('app:systems');

const systems = []

const { System } = require('../../../models/gov/equipment/systems');

// Load function to load all systems.
async function loadSystems () {
    let count = 0;

    await systemData.forEach(system => {
        systemsDebugger(system);
        systems[count] = new Sys(system);
        count++;
    });

    return `${count} systems availible in WTS...`
};

// Knowledge Constructor Function
function Sys(system) {
    this.name = system.name;
    this.cost = system.cost;
    this.prereq = system.prereq;
    this.desc = system.desc;
    this.category = system.category;
    this.stats = system.stats;
    this.code  = system.code;
    this.unitType = system.unitType;
    this.buildTime = system.buildTime;

    this.build = async function() {
        let newSystem = new System(this)

        await newSystem.save();

        console.log(`${newSystem.name} has been built...`)

        return newSystem;
    }
}

// determines if system is valid for passed unitType (i.e., is it in the unitType array)
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

module.exports = { loadSystems, systems, validUnitType };