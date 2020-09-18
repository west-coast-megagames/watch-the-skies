const routeDebugger = require('debug')('app:routes');

const upgrade = require('../../models/gov/upgrade/upgrade');
const { Upgrade } = require('../../models/gov/upgrade/upgrade');



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
	unit
}

module.exports = { upgradeValue } 