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
	upgrade = await Upgrade.findById(upgrade._id);

	if (upgrade.status.storage)
		return `This Upgrade is already in use somewhere!`;
		
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
		default:
			return "UwU could not find the right Unit for addUpgrade! someone made an oopsie-woopsie!";
	
	}
	try{
		unit.upgrades.push(upgrade);
		upgrade.status.storage = false;
		upgrade = await upgrade.save();
		unit = await unit.save();
		return unit;
	}
	catch(err){
		return `ERROR IN addUpgrade: ${err}`;
	}

}

async function removeUpgrade(upgrade, unit){
	upgrade = await Upgrade.findById(upgrade._id);
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
		default:
			return "UwU could not find the right Unit for removeUpgrade! someone made an oopsie-woopsie!";
	}
	let response = "Could not find desired Upgrade to remove from unit";
	const index = unit.upgrades.indexOf(upgrade._id);
	if (index > -1) {
		unit.upgrades.splice(index, 1);
		response = `Removed "${upgrade.name}" from unit "${unit.name}"`
	}
	try{
		unit = await unit.save();
		upgrade.status.storage= true;
		upgrade = await upgrade.save();

		return response;		
	}
	catch(err){
		return `ERROR IN removeUpgrade: ${err}`;
	}

}

module.exports = { upgradeValue, addUpgrade, removeUpgrade } 