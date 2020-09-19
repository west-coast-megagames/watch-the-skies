const routeDebugger = require('debug')('app:routes');

const upgrade = require('../../models/gov/upgrade/upgrade');
const { Upgrade } = require('../../models/gov/upgrade/upgrade');
const { Military } = require('../../models/ops/military/military');
const { Squad } = require('../../models/ops/squad');
const { Aircraft } = require('../../models/ops/aircraft');
const { Facility } = require('../../models/gov/facility/facility');


/*
function that applies upgrade to any unit

make a funtion that takes the upgrade array of a unit and returns
the desired numerical stat effect
*/
async function upgradeValue(upgradeArray, desiredStat){
	let total = 0;
	for(element of upgradeArray){//for every upgrade in the upgrade array
		for(stat in element.stats){//and for every element in the stat object of the upgrade
			if(stat === desiredStat)//if the key (stat) is the stat we want
				total = total + element.stats[stat];//add it to total
		}
	}

	return total;
}

//pass me the full unit 
async function addUpgrade(upgrade, unit){
	//upgrade = await Upgrade.findById
	switch(unit.model){
		case "Military":
			unit = await Military.findById(unit._id);
			break;
		case "Squad":
			unit = await Squad.findById(unit._id);
			break;
		case "Aircraft":
			unit = await Aircraft.findById(unit._id);
			break;
		case "Facility":
			unit = await Facility.findById(unit._id)
			break;
	}

	unit.upgrades.push(upgrade);
	unit = await unit.save();
	return unit;
}

module.exports = { upgradeValue, addUpgrade } 