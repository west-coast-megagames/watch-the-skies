const fs = require('fs')
const config = require('config');

const file = fs.readFileSync(require.resolve(config.get('initPathWTS') + 'json/upgrade/milGear.json'));
const gearData = JSON.parse(file);

upgradeDebugger = require('debug')('app:upgrade');

const gears = []

const { Gear } = require('../../../models/upgrade');

// Load function to load all upgrade.
async function loadMilGears () {
    let count = 0;

    await gearData.forEach(gear => {
        upgradeDebugger(gear);
        gears[count] = new Equip(gear);
        count++;
    });

    return `${count} military upgrade available in WTS...`
};

// Knowledge Constructor Function
function Equip(gear) {
    this.name = gear.name;
    this.cost = gear.cost;
    this.prereq = gear.prereq;
    this.desc = gear.desc;
    this.category = gear.category;
    this.stats = gear.stats;
    this.code  = gear.code;
    this.unitType = gear.unitType;
    this.buildTime = gear.buildTime;

    this.build = async function() {
        let newGear = new Gear(this)

        await newGear.save();

        console.log(`${newGear.name} has been built...`)

        return newGear;
    }
}

// determines if milGear is valid for passed unitType (i.e., is it in the unitType array)
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

module.exports = { loadMilGears, gears, validUnitType };