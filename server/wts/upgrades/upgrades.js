const { Upgrade } = require('../../models/upgrade');
const { Military } = require('../../models/military');
const { Squad } = require('../../models/squad');
const { Aircraft } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const { Account } = require('../../models/account');
const { clearArrayValue, addArrayValue } = require('../../middleware/util/arrayCalls');

/*
function that applies upgrade to any unit

make a funtion that takes the upgrade array of a unit and returns
the desired numerical stat effect
*/
async function upgradeValue (upgradeArray, desiredStat) {
	let total = 0;
	for(const element of upgradeArray) {// for every upgrade in the upgrade array and for every element in the stat object of the upgrade
		for(const stat of element.effects) {
			if(stat.type === desiredStat) total = total + stat.value; // if the key (stat) is the stat we want add it to total
		}
	}
	return total;
}

// pass me the full unit
async function addUpgrade (data) {
	// console.log(data);
	let { upgrade, unit, model } = data;
	upgrade = await Upgrade.findById(upgrade);

	if (!upgrade.status.some(el => el === 'storage')) return 'This Upgrade is already in use somewhere!';

	switch(model) {
	case 'Military':
		unit = await Military.findById(unit);
		break;
	case 'Squad':
		unit = await Squad.findById(unit);
		break;
	case 'Aircraft':
		unit = await Aircraft.findById(unit);
		break;
	case 'Facility':
		unit = await Facility.findById(unit);
		break;
	default:
		return ({ message : `UwU could not find the right Unit for addUpgrade! ${unit} `, type: 'error' });
	}
	try{
		unit.upgrades.push(upgrade);
		await clearArrayValue(upgrade.status, 'storage');
		upgrade.team = unit.team; // this is in case an upgrade is made by control, the team still gets it
		for (const element of upgrade.effects) {// add all unit types and effects here
			switch (element.type) {
			case 'attack':
				unit.stats.attack += element.value;
				break;
			case 'defense':
				unit.stats.defense += element.value;
				break;
			default: break;
			}
		}
		upgrade = await upgrade.save();
		unit = await unit.save();
		return ({ message : `Added "${upgrade.name}" to unit "${unit.name}"`, type: 'success' });
	}
	catch(err) {
		console.log(err);
		return ({ message : `ERROR IN addUpgrade: ${err}`, type: 'error' });
	}

}

async function removeUpgrade (data) {
	let { upgrade, unit, model } = data;
	upgrade = await Upgrade.findById(upgrade);
	switch(model) {
	case 'Military':
		unit = await Military.findById(unit._id);
		break;
	case 'Squad':
		unit = await Squad.findById(unit._id);
		break;
	case 'Aircraft':
		unit = await Aircraft.findById(unit._id);
		break;
	case 'Facility':
		unit = await Facility.findById(unit._id);
		break;
	default:
		return ({ message : `UwU could not find the right Unit for removeUpgrade! ${unit} `, type: 'error' });
	}
	let response = 'Could not find desired Upgrade to remove from unit';
	const index = unit.upgrades.indexOf(upgrade._id);
	if (index > -1) {
		unit.upgrades.splice(index, 1);
		response = `Removed "${upgrade.name}" from unit "${unit.name}"`;
		for (const element of upgrade.effects) {
			switch (element.type) {
			case 'attack':
				unit.stats.attack -= element.value;
				break;
			case 'defense':
				unit.stats.defense -= element.value;
				break;
			default: break;
			}
		}
	}
	try{
		unit = await unit.save();
		await addArrayValue(upgrade.status, 'storage');
		upgrade = await upgrade.save();
		return ({ message : response, type: 'success' });
	}
	catch(err) {
		return ({ message : `ERROR IN removeUpgrade: ${err}`, type: 'error' });
	}

}

async function repairUpgrade (data) {
	const upgrade = await Upgrade.findById(data._id);

	let account = await Account.findOne({
		name: 'Operations',
		team: upgrade.team
	});

	// TODO John Review how to update for resources
	let resource = 'Megabucks';
	let index = account.resources.findIndex(el => el.type === resource);
	if (index < 0) {
		// error send here
		return ({ message : `Balance not found for operations account to repair ${upgrade.name}.`, type: 'error' });
	} 
	else {
		if (account.balance < 2) {
			// error send here
			return ({ message : `No Funding! Assign more money to your operations account to repair ${upgrade.name}.`, type: 'error' });
		}
		else {
			account = await account.withdrawal({ from: account, amount: 2, note: `Repairs for ${upgrade.name}` });
			await account.save();

			// await addArrayValue(upgrade.status, 'repair');
			// await clearArrayValue(upgrade.status, 'ready');
			await clearArrayValue(upgrade.status, 'destroyed');
			await clearArrayValue(upgrade.status, 'damaged');
			await upgrade.save();
			return ({ message : `${upgrade.name} repaired!`, type: 'success' });
		}
	}
}

module.exports = { upgradeValue, addUpgrade, removeUpgrade, repairUpgrade };