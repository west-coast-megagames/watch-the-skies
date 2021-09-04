const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

// type are Terrestrial(earth) and Alien (T or A)
const typeVals = ['Ground', 'Space'];

function inArray(array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkOrganization(runFlag) {
	// get sites once
	let sFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}api/sites/`);
		sFinds = data;
	}
	catch(err) {
		logger.error(`Sites Get Error (organizationCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	let cFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initOrganizations/lean`);
		cFinds = data;
	}
	catch(err) {
		logger.error(`Organization Get Lean Error (organizationCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const organization of cFinds) {

		if (!Object.prototype.hasOwnProperty.call(organization, 'model')) {
			logger.error(`model missing for Organization ${organization.code} ${organization._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'type')) {
			logger.error(`type missing for Organization ${organization.code} ${organization._id}`);
		}
		else if (!inArray(typeVals, organization.type)) {
			logger.error(
				`Invalid type ${organization.type} for Organization ${organization.code} ${organization._id}`
			);
		}
		else if (organization.type === 'Ground') {
			if (!Object.prototype.hasOwnProperty.call(organization, 'tags')) {
				logger.error(
					`tags missing for Organization ${organization.code} ${organization._id}`
				);
			}

			if (!Object.prototype.hasOwnProperty.call(organization, 'capital')) {
				// Antarctica (AQ) does not have a capital
				if (!organization.code === 'AQ') {
					logger.error(
						`capital missing for Organization ${organization.code} ${organization._id}`
					);
				}
			}

			if (!Object.prototype.hasOwnProperty.call(organization, 'borderedBy')) {
				logger.error(
					`borderedBy missing for Organization ${organization.code} ${organization._id}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'serviceRecord')) {
			logger.error(
				`serviceRecord missing for Organization ${organization.code} ${organization._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'zone')) {
			logger.error(`zone missing for Organization ${organization.code} ${organization._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'team')) {
			logger.error(`team missing for Organization ${organization.code} ${organization._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'code')) {
			logger.error(`code missing for Organization ${organization.name} ${organization._id}`);
		}
		else if (
			organization.code === '' ||
        organization.code == undefined ||
        organization.code == null
		) {
			logger.error(`code is blank for Organization ${organization.name} ${organization._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'name')) {
			logger.error(`name missing for Organization ${organization.code} ${organization._id}`);
		}
		else if (
			organization.name === '' ||
        organization.name == undefined ||
        organization.name == null
		) {
			logger.error(
				`name is blank for Organization ${organization.code} ${organization._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'unrest')) {
			logger.error(`unrest missing for Organization ${organization.code} ${organization._id}`);
		}
		else if (isNaN(organization.unrest)) {
			logger.error(
				`Organization ${organization.code} ${organization._id} unrest is not a number ${organization.unrest}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'milAlliance')) {
			logger.error(
				`milAlliance missing for Organization ${organization.code} ${organization._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'sciAlliance')) {
			logger.error(
				`sciAlliance missing for Organization ${organization.code} ${organization._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'stats')) {
			logger.error(`stats missing for Organization ${organization.code} ${organization._id}`);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(organization.stats, 'sciRate')) {
				logger.error(
					`stats.sciRate missing for Organization ${organization.code} ${organization._id}`
				);
			}
			else if (isNaN(organization.stats.sciRate)) {
				logger.error(
					`Organization ${organization.code} ${organization._id} stats.sciRate is not a number ${organization.stats.sciRate}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(organization.stats, 'balance')) {
				logger.error(
					`stats.balance missing for Organization ${organization.code} ${organization._id}`
				);
			}
			else if (isNaN(organization.stats.balance)) {
				logger.error(
					`Organization ${organization.code} ${organization._id} stats.balance is not a number ${organization.stats.balance}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(organization, 'formalName')) {
			logger.error(
				`formalName missing for Organization ${organization.code} ${organization._id}`
			);
		}
		else if (
			organization.formalName === '' ||
        organization.formalName == undefined ||
        organization.formalName == null
		) {
			logger.error(
				`formalName is blank for Organization ${organization.code} ${organization._id}`
			);
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initOrganizations/validate/${organization._id}`);
			if (!valMessage.data.type) {
				logger.error(`Validation Error For ${organization.code} ${organization.name}: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Organization Validation Error For ${organization.code} ${organization.name} Error: ${err.message}`
			);
		}

		// if not space, should have at least 1 city site
		// if space, should have at least 1 spacecraft
		const organizationId = organization._id;
		let cityCount = 0;
		let spacecraftCount = 0;

		siteLoop: for (let j = 0; j < sFinds.length; ++j) {
			if (sFinds[j].organization) {
				const sOrganizationId = sFinds[j].organization._id;

				if (sOrganizationId === organizationId) {
					if (sFinds[j].subType === 'City' && sFinds[j].type === 'Ground') {
						++cityCount;
					}
					else if (sFinds[j].type === 'Space') {
						++spacecraftCount;
					}
				}
			}

			// only need 1
			if (organization.type === 'Ground' && cityCount > 0) {
				break siteLoop;
			}
			else if (organization.type === 'Space' && spacecraftCount > 0) {
				break siteLoop;
			}
		}

		if (organization.type === 'Ground') {
			if (cityCount < 1) {
				logger.error(
					`No Cities Found In Ground Organization ${organization.code} ${organization.name}`
				);
			}
		}
		else if (organization.type === 'Space') {
			if (spacecraftCount < 1) {
				logger.error(
					`No Spacecraft Found In Space Organization ${organization.code} ${organization.name}`
				);
			}
		}
	}
	runFlag = true;
	return runFlag;
}

module.exports = chkOrganization;
