const mongoose = require('mongoose'); // Mongo DB object modeling module
const nexusError = require('../../middleware/util/throwError'); // Costom error handler util

// Global Constants

async function validAccount(account) {
	const { Account } = require('../../models/account'); // Import of Account model [Mongoose]
	if (account === undefined) nexusError('No account ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(account)) return nexusError('Invalid Account ID given...', 400);
	const document = await Account.findById(account);
	if (document == null) nexusError(`No account exists with the ID: ${account}`, 400);
}

async function validCountry(country) {
	const { Country } = require('../../models/country'); // Import of Country model [Mongoose]
	if (country === undefined) nexusError('No country ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(country)) nexusError('Invalid country ID given...', 400);
	const document = await Country.findById(country);
	if (document == null) nexusError(`No country exists with the ID: ${country}`, 400);
}

async function validFacility(facility) {
	const { Facility } = require('../../models/facility'); // Import of Facility model [Mongoose]
	if (facility === undefined) nexusError('No facility ID given for origin...', 400);
	if (!mongoose.Types.ObjectId.isValid(facility)) nexusError('Invalid facility ID given for origin...', 400);
	const facilityDoc = await Facility.findById(facility);
	if (facilityDoc == null) nexusError(`No facility exists with the ID: ${facility}`, 400);
}

async function validSite(site) {
	const { Site } = require('../../models/site'); // Import of Site model [Mongoose]
	if (site === undefined) nexusError('No site ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(site)) nexusError('Invalid site ID given...', 400);
	const document = await Site.findById(site);
	if (document == null) nexusError(`No site exists with the ID: ${site}`, 400);
}

async function validTeam(team) {
	const { Team } = require('../../models/team'); // Import of Team model [Mongoose]
	if (team === undefined) nexusError('No team ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(team)) return nexusError('Invalid Team ID given...', 400);
	const document = await Team.findById(team);
	if (document == null) nexusError(`No team exists with the ID: ${team}`, 400);
}

async function validZone(zone) {
	const { Zone } = require('../../models/zone'); // Import of Zone model [Mongoose]
	if (zone === undefined) nexusError('No zone ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(zone)) nexusError('Invalid zone ID given...', 400);
	const document = await Zone.findById(zone);
	if (document == null) nexusError(`No zone exists with the ID: ${zone}`, 400);
}

async function validLog(log) {
	const { Log } = require('../../models/logs/log'); // Import of log (ServiceRecord) model [Mongoose]
	if (log === undefined) nexusError('No log ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(log)) nexusError('Invalid log ID given...', 400);
	const document = await Log.findById(log);
	if (document == null) nexusError(`No log exists with the ID: ${log}`, 400);
}

async function validUpgrade(upgrade) {
	const { Upgrade } = require('../../models/upgrade'); // Import of Upgrade model [Mongoose]
	if (upgrade === undefined) nexusError('No upgrade ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(upgrade)) nexusError('Invalid upgrade ID given...', 400);
	const document = await Upgrade.findById(upgrade);
	if (document == null) nexusError(`No upgrade exists with the ID: ${upgrade}`, 400);
}

async function validTrade(trade) {
	const { Trade } = require('../../models/trade'); // Import of Trade model [Mongoose]
	if (trade === undefined) nexusError('No trade ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(trade)) nexusError('Invalid trade ID given...', 400);
	const document = await Trade.findById(trade);
	if (document == null) nexusError(`No trade exists with the ID: ${trade}`, 400);
}

async function validTreaty(treaty) {
	const { Treaty } = require('../../models/treaty'); // Import of Treaty model [Mongoose]
	if (treaty === undefined) nexusError('No treaty ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(treaty)) nexusError('Invalid treaty ID given...', 400);
	const document = await Treaty.findById(treaty);
	if (document == null) nexusError(`No treaty exists with the ID: ${treaty}`, 400);
}

async function validResearch(research) {
	const { Research } = require('../../models/research'); // Import of Research model [Mongoose]
	if (research === undefined) nexusError('No research ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(research)) nexusError('Invalid research ID given...', 400);
	const document = await Research.findById(research);
	if (document == null) nexusError(`No research exists with the ID: ${research}`, 400);
}

async function validAircraft(aircraft) {
	const { Aircraft } = require('../../models/aircraft'); // Import of Aircraft model [Mongoose]
	if (aircraft === undefined) nexusError('No aircraft ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(aircraft)) nexusError('Invalid aircraft ID given...', 400);
	const document = await Aircraft.findById(aircraft);
	if (document == null) nexusError(`No aircraft exists with the ID: ${aircraft}`, 400);
}

async function validMilitary(military) {
	const { Military } = require('../../models/military'); // Import of Military model [Mongoose]
	if (military === undefined) nexusError('No military ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(military)) nexusError('Invalid military ID given...', 400);
	const document = await Military.findById(military);
	if (document == null) nexusError(`No military exists with the ID: ${military}`, 400);
}

module.exports = { validAccount, validCountry, validFacility, validSite,
	validTeam, validZone, validLog, validUpgrade, validTrade, validTreaty,
	validResearch, validAircraft, validMilitary };