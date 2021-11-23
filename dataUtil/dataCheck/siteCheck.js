const gameServer = require('../config/config').gameServer;
const axios = require('axios');
// Site Model - Using Mongoose Model

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const groundSubTypeVals = ['City', 'Crash', 'Point of Interest'];
const typeVals = ['Ground', 'Space'];
const spaceSubTypeVals = [
	'Satellite',
	'Cruiser',
	'Battleship',
	'Hauler',
	'Station'
];

function inArray(array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkSite(runFlag) {
	let sFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initSites/lean`);
		sFinds = data;
	}
	catch(err) {
		logger.error(`Site Get Lean Error (siteCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const site of sFinds) {

		if (!Object.prototype.hasOwnProperty.call(site, 'model')) {
			logger.error(`model missing for Site ${site.name} ${site._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(site, 'name')) {
			logger.error(`name missing for Site ${site.code} ${site._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(site, 'team')) {
			logger.error(`Team missing for Site ${site.name} ${site._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(site, 'zone')) {
			logger.error(`Zone missing for Site ${site.name} ${site._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(site, 'organization')) {
			logger.error(`Organization missing for Site ${site.name} ${site._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(site, 'code')) {
			logger.error(`code missing for Site ${site.name} ${site._id}`);
		}
		else if (
			site.code === '' ||
        site.code == undefined ||
        site.code == null
		) {
			logger.error(`code is blank for Site ${site.name} ${site._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(site, 'serviceRecord')) {
			logger.error(`serviceRecord missing for Sie ${site.name} ${site._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(site, 'facilities')) {
			logger.error(`facilities missing for Site ${site.name} ${site._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(site, 'hidden')) {
			logger.error(`hidden missing for Site ${site.name} ${site._id}`);
		}

		let checkSiteType = '';
		if (!Object.prototype.hasOwnProperty.call(site, 'type')) {
			logger.error(`Site type is missing  ${site.name} ${site._id}`);
		}
		else {
			checkSiteType = site.type;
			if (!inArray(typeVals, site.type)) {
				logger.error(
					`Invalid type ${site.type} for Site ${site.name} ${site._id}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(site, 'subType')) {
			logger.error(`Site subType is missing  ${site.name} ${site._id}`);
		}
		else {
			switch (checkSiteType) {
			case 'Ground':
				if (!inArray(groundSubTypeVals, site.subType)) {
					logger.error(
						`Invalid Ground subType ${site.subType} for Site ${site.name} ${site._id}`
					);
				}
				break;

			case 'Space':
				if (!inArray(spaceSubTypeVals, site.subType)) {
					logger.error(
						`Invalid Space subType ${site.subType} for Site ${site.name} ${site._id}`
					);
				}
				break;

			default:
				// logger.error(`Invalid Site Type: ${}`);
				// taken care of above in site type validation
			}

			if (site.type === 'Ground') {
				if (!Object.prototype.hasOwnProperty.call(site, 'tags')) {
					logger.error(`tags missing for Site ${site.name} ${site._id}`);
				}

				if (!Object.prototype.hasOwnProperty.call(site, 'geoDMS')) {
					logger.error(`geoDMS missing for Site ${site.name} ${site._id}`);
				}
				else {
					if (!Object.prototype.hasOwnProperty.call(site.geoDMS, 'latDMS')) {
						logger.error(
							`citySite Site ${site.name} ${site._id} has missing geoDMS latDMS`
						);
					}
					else if (site.geoDMS.latDMS === '' ||
              site.geoDMS.latDMS === 'undefined') {
						logger.error(
							`citySite Site ${site.name} ${site._id} has an invalid or blank geoDMS latDMS ${site.geoDMS.latDMS}`
						);
					}


					if (!Object.prototype.hasOwnProperty.call(site.geoDMS, 'lngDMS')) {
						logger.error(
							`citySite Site ${site.name} ${site._id} has missing geoDMS lngDMS ${site.geoDMS.latDMS}`
						);
					}
					else if (
						site.geoDMS.lngDMS === '' ||
              site.geoDMS.lngDMS === 'undefined'
					) {
						logger.error(
							`citySite Site ${site.name} ${site._id} has an invalid or blankk geoDMS lngDMS ${site.geoDMS.lngDMS}`
						);
					}
				}

				if (!Object.prototype.hasOwnProperty.call(site, 'geoDecimal')) {
					logger.error(`geoDecimal missing for Site ${site.name} ${site._id}`);
				}
				else {
					if (!Object.prototype.hasOwnProperty.call(site.geoDecimal, 'lat')) {
						logger.error(
							`citySite Site ${site.name} ${site._id} has missing geoDecimal lat`
						);
					}
					else {
						if (isNaN(site.geoDecimal.lat)) {
							logger.error(
								`Site ${site.name} ${site._id} lat is not a number ${site.geoDecimal.lat}`
							);
						}
						if (site.geoDecimal.lat < -90 ||
              site.geoDecimal.lat > 90
						) {
							logger.error(
								`Site ${site.name} ${site._id} has an invalid geoDecimal lat ${site.geoDecimal.lat}`
							);
						}
					}
					if (!Object.prototype.hasOwnProperty.call(site.geoDecimal, 'lng')) {
						logger.error(
							`citySite Site ${site.name} ${site._id} has missing geoDecimal lng`
						);
					}
					else {
						if (isNaN(site.geoDecimal.lng)) {
							logger.error(
								`Site ${site.name} ${site._id} lng is not a number ${site.geoDecimal.lng}`
							);
						}
						if (site.geoDecimal.lng < -180 ||
              site.geoDecimal.lng > 180
						) {
							logger.error(
								`Site ${site.name} ${site._id} has an invalid geoDecimal lng ${site.geoDecimal.lng}`
							);
						}
					}
				}

				if (!Object.prototype.hasOwnProperty.call(site, 'dateline')) {
					logger.error(
						`dateline missing for Ground Site ${site.name} ${site._id}`
					);
				}
				else if (site.dateline === '' || site.dateline === 'undefined') {
					logger.error(
						`Ground Site ${site.name} ${site._id} has an invalid or blank dateline ${site.dateline}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(site, 'status')) {
					logger.error(
						`status missing for ${site.subType} Site ${site.name} ${site._id}`
					);
				}
			}

			if (site.type === 'Space') {
				if (!Object.prototype.hasOwnProperty.call(site, 'status')) {
					logger.error(
						`status missing for Space Site ${site.name} ${site._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(site, 'geoDMS')) {
					logger.error(`geoDMS missing for Site ${site.name} ${site._id}`);
				}
				else {
					if (!Object.prototype.hasOwnProperty.call(site.geoDMS, 'latDMS')) {
						logger.error(
							`spaceSite Site ${site.name} ${site._id} has missing geoDMS latDMS`
						);
					}
					else if (site.geoDMS.latDMS === '' ||
              site.geoDMS.latDMS === 'undefined') {
						logger.error(
							`spaceSite Site ${site.name} ${site._id} has an invalid or blank geoDMS latDMS ${site.geoDMS.latDMS}`
						);
					}


					if (!Object.prototype.hasOwnProperty.call(site.geoDMS, 'lngDMS')) {
						logger.error(
							`spaceSite Site ${site.name} ${site._id} has missing geoDMS lngDMS ${site.geoDMS.latDMS}`
						);
					}
					else if (
						site.geoDMS.lngDMS === '' ||
              site.geoDMS.lngDMS === 'undefined'
					) {
						logger.error(
							`spaceSite Site ${site.name} ${site._id} has an invalid or blankk geoDMS lngDMS ${site.geoDMS.lngDMS}`
						);
					}
				}

				if (!Object.prototype.hasOwnProperty.call(site, 'geoDecimal')) {
					logger.error(`geoDecimal missing for Site ${site.name} ${site._id}`);
				}
				else {
					if (!Object.prototype.hasOwnProperty.call(site.geoDecimal, 'lat')) {
						logger.error(
							`spaceSite Site ${site.name} ${site._id} has missing geoDecimal lat`
						);
					}
					else {
						if (isNaN(site.geoDecimal.lat)) {
							logger.error(
								`Site ${site.name} ${site._id} lat is not a number ${site.geoDecimal.lat}`
							);
						}
						if (site.geoDecimal.lat < -90 ||
              site.geoDecimal.lat > 90
						) {
							logger.error(
								`Site ${site.name} ${site._id} has an invalid geoDecimal lat ${site.geoDecimal.lat}`
							);
						}
					}
					if (!Object.prototype.hasOwnProperty.call(site.geoDecimal, 'lng')) {
						logger.error(
							`spaceSite Site ${site.name} ${site._id} has missing geoDecimal lng`
						);
					}
					else {
						if (isNaN(site.geoDecimal.lng)) {
							logger.error(
								`Site ${site.name} ${site._id} lng is not a number ${site.geoDecimal.lng}`
							);
						}
						if (site.geoDecimal.lng < -180 ||
              site.geoDecimal.lng > 180
						) {
							logger.error(
								`Site ${site.name} ${site._id} has an invalid geoDecimal lng ${site.geoDecimal.lng}`
							);
						}
					}
				}
			}
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initSites/validate/${site._id}`);
			if (!valMessage.data.type) {
				logger.error(`Validation Error For ${site.code} ${site.name}: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Site Validation Error For ${site.code} ${site.name} Error: ${err.message}`
			);
		}
	}
	runFlag = true;
	return runFlag;
}

module.exports = chkSite;
