const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

// type are Terrestrial(earth) and Alien (T or A)
const typeVals = ['Ground', 'Space'];

function inArray (array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkCountry (runFlag) {
	// get sites once
	let sFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}api/sites/`);
		sFinds = data;
	}
	catch(err) {
		logger.error(`Sites Get Error (countryCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	let cFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initCountries/lean`);
		cFinds = data;
	}
	catch(err) {
		logger.error(`Country Get Lean Error (countryCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const country of cFinds) {

		if (!Object.prototype.hasOwnProperty.call(country, 'model')) {
			logger.error(`model missing for Country ${country.code} ${country._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'type')) {
			logger.error(`type missing for Country ${country.code} ${country._id}`);
		}
		else if (!inArray(typeVals, country.type)) {
			logger.error(
				`Invalid type ${country.type} for Country ${country.code} ${country._id}`
			);
		}
		else if (country.type === 'Ground') {
			if (!Object.prototype.hasOwnProperty.call(country, 'coastal')) {
				logger.error(
					`coastal missing for Country ${country.code} ${country._id}`
				);
			}

			if (!Object.prototype.hasOwnProperty.call(country, 'capital')) {
				// Antarctica (AQ) does not have a capital
				if (!country.code === 'AQ') {
					logger.error(
						`capital missing for Country ${country.code} ${country._id}`
					);
				}
			}

			if (!Object.prototype.hasOwnProperty.call(country, 'borderedBy')) {
				logger.error(
					`borderedBy missing for Country ${country.code} ${country._id}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'gameState')) {
			logger.error(
				`gameState missing for Country ${country.code} ${country._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'serviceRecord')) {
			logger.error(
				`serviceRecord missing for Country ${country.code} ${country._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'zone')) {
			logger.error(`zone missing for Country ${country.code} ${country._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'team')) {
			logger.error(`team missing for Country ${country.code} ${country._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'code')) {
			logger.error(`code missing for Country ${country.name} ${country._id}`);
		}
		else if (
			country.code === '' ||
        country.code == undefined ||
        country.code == null
		) {
			logger.error(`code is blank for Country ${country.name} ${country._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'name')) {
			logger.error(`name missing for Country ${country.code} ${country._id}`);
		}
		else if (
			country.name === '' ||
        country.name == undefined ||
        country.name == null
		) {
			logger.error(
				`name is blank for Country ${country.code} ${country._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'unrest')) {
			logger.error(`unrest missing for Country ${country.code} ${country._id}`);
		}
		else if (isNaN(country.unrest)) {
			logger.error(
				`Country ${country.code} ${country._id} unrest is not a number ${country.unrest}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'milAlliance')) {
			logger.error(
				`milAlliance missing for Country ${country.code} ${country._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'sciAlliance')) {
			logger.error(
				`sciAlliance missing for Country ${country.code} ${country._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'stats')) {
			logger.error(`stats missing for Country ${country.code} ${country._id}`);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(country.stats, 'sciRate')) {
				logger.error(
					`stats.sciRate missing for Country ${country.code} ${country._id}`
				);
			}
			else if (isNaN(country.stats.sciRate)) {
				logger.error(
					`Country ${country.code} ${country._id} stats.sciRate is not a number ${country.stats.sciRate}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(country.stats, 'balance')) {
				logger.error(
					`stats.balance missing for Country ${country.code} ${country._id}`
				);
			}
			else if (isNaN(country.stats.balance)) {
				logger.error(
					`Country ${country.code} ${country._id} stats.balance is not a number ${country.stats.balance}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(country, 'formalName')) {
			logger.error(
				`formalName missing for Country ${country.code} ${country._id}`
			);
		}
		else if (
			country.formalName === '' ||
        country.formalName == undefined ||
        country.formalName == null
		) {
			logger.error(
				`formalName is blank for Country ${country.code} ${country._id}`
			);
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initCountries/validate/${country._id}`);
			if (!valMessage.data.type) {
				logger.error(`Validation Error For ${country.code} ${country.name}: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Country Validation Error For ${country.code} ${country.name} Error: ${err.message}`
			);
		}

		// if not space, should have at least 1 city site
		// if space, should have at least 1 spacecraft
		const countryId = country._id;
		let cityCount = 0;
		let spacecraftCount = 0;

		siteLoop: for (let j = 0; j < sFinds.length; ++j) {
			if (sFinds[j].country) {
				const sCountryId = sFinds[j].country._id;

				if (sCountryId === countryId) {
					if (sFinds[j].subType === 'City' && sFinds[j].type === 'Ground') {
						++cityCount;
					}
					else if (sFinds[j].type === 'Space') {
						++spacecraftCount;
					}
				}
			}

			// only need 1
			if (country.type === 'Ground' && cityCount > 0) {
				break siteLoop;
			}
			else if (country.type === 'Space' && spacecraftCount > 0) {
				break siteLoop;
			}
		}

		if (country.type === 'Ground') {
			if (cityCount < 1) {
				logger.error(
					`No Cities Found In Ground Country ${country.code} ${country.name}`
				);
			}
		}
		else if (country.type === 'Space') {
			if (spacecraftCount < 1) {
				logger.error(
					`No Spacecraft Found In Space Country ${country.code} ${country.name}`
				);
			}
		}
	}
	runFlag = true;
	return runFlag;
}

module.exports = chkCountry;
