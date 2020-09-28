const mongoose = require('mongoose'); // Mongo DB object modeling module
const nexusError = require('../../middleware/util/throwError'); // Costom error handler util

// Global Constants
const { Account } = require('../../models/account'); // Import of Account model [Mongoose]
const { Country } = require('../../models/country'); // Import of Country model [Mongoose]
const { Facility } = require('../../models/facility'); // Import of Facility model [Mongoose]
const { Site } = require('../../models/site'); // Import of Site model [Mongoose]
const { Team } = require('../../models/team'); // Import of Team model [Mongoose]
const { Upgrade } = require('../../models/upgrade'); // Import of Upgrade model [Mongoose]
const { Zone } = require('../../models/zone'); // Import of Zone model [Mongoose]
const { Log } = require('../../models/logs/log'); // Import of log (ServiceRecord) model [Mongoose]

async function validAccount (account) {
	if (account === undefined) nexusError('No account ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(account)) nexusError('Invalid Account ID given...', 400);
	const document = await Account.findById(account);
	if (document == null) nexusError(`No account exists with the ID: ${account}`, 400);
}

async function validCountry (country) {
	if (country === undefined) nexusError('No country ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(country)) nexusError('Invalid country ID given...', 400);
	const document = await Country.findById(country);
	if (document == null) nexusError(`No country exists with the ID: ${country}`, 400);
}

async function validFacility (facility) {
	if (facility === undefined) nexusError('No facility ID given for origin...', 400);
	if (!mongoose.Types.ObjectId.isValid(facility)) nexusError('Invalid facility ID given for origin...', 400);
	const facilityDoc = await Facility.findById(facility);
	if (facilityDoc == null) nexusError(`No facility exists with the ID: ${facility}`, 400);
}

async function validSite (site) {
	if (site === undefined) nexusError('No site ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(site)) nexusError('Invalid site ID given...', 400);
	const document = await Site.findById(site);
	if (document == null) nexusError(`No site exists with the ID: ${site}`, 400);
}

async function validTeam (team) {
	if (team === undefined) nexusError('No team ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(team)) nexusError('Invalid Team ID given...', 400);
	const document = await Team.findById(team);
	if (document == null) nexusError(`No team exists with the ID: ${team}`, 400);
}

async function validZone (zone) {
	if (zone === undefined) nexusError('No zone ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(zone)) nexusError('Invalid zone ID given...', 400);
	const document = await Zone.findById(zone);
	if (document == null) nexusError(`No zone exists with the ID: ${zone}`, 400);
}

async function validLog (log) {
	if (log === undefined) nexusError('No log ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(log)) nexusError('Invalid log ID given...', 400);
	const document = await Log.findById(log);
	if (document == null) nexusError(`No log exists with the ID: ${log}`, 400);
}

async function validUpgrade (upgrade) {
	if (upgrade === undefined) nexusError('No upgrade ID given...', 400);
	if (!mongoose.Types.ObjectId.isValid(upgrade)) nexusError('Invalid upgrade ID given...', 400);
	const document = await Upgrade.findById(upgrade);
	if (document == null) nexusError(`No upgrade exists with the ID: ${upgrade}`, 400);
}

module.exports = { validAccount, validCountry, validFacility, validSite, validTeam, validZone, validLog, validUpgrade };