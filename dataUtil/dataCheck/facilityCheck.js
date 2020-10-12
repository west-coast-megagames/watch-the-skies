const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const typeList = ['Hanger', 'Crisis', 'Civilian', 'Research', 'Base'];

function inArray (array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkFacility (runFlag) {
	let fFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initFacilities/lean`);
		fFinds = data;
	}
	catch(err) {
		logger.error(`Facility Get Lean Error (facilityCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for (const facility of fFinds) {

		if (!Object.prototype.hasOwnProperty.call(facility, 'model')) {
			logger.error(
				`model missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'gameState')) {
			logger.error(
				`gameState missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'name')) {
			logger.error(`name missing for Facility ${facility._id}`);
		}
		else if (
			facility.name === '' ||
        facility.name == undefined ||
        facility.name == null
		) {
			logger.error(
				`name is blank for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'team')) {
			logger.error(
				`team missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'site')) {
			logger.error(
				`site missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'code')) {
			logger.error(
				`code missing for Facility ${facility.name} ${facility._id}`
			);
		}
		else if (
			facility.code === '' ||
        facility.code == undefined ||
        facility.code == null
		) {
			logger.error(
				`code is blank for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'gameState')) {
			logger.error(
				`gameState missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'upgrade')) {
			logger.error(
				`upgrade missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'capability')) {
			logger.error(
				`capability missing for Facility ${facility.name} ${facility._id}`
			);
		}
		else {
			// only some of the capabilities may be present, so check that they exist rather than not
			if (Object.prototype.hasOwnProperty.call(facility.capability, 'research')) {
				let researchCapacity = 0;
				let researchActive = false;
				if (!Object.prototype.hasOwnProperty.call(facility.capability.research, 'capacity')) {
					logger.error(
						`research capacity missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else if (isNaN(facility.capability.research.capacity)) {
					logger.error(
						`research Facility ${facility.name} ${facility._id} research capacity is not a number ${facility.capability.research.capacity}`
					);
				}
				else {
					researchCapacity = facility.capability.research.capacity;
				}
				if (!Object.prototype.hasOwnProperty.call(facility.capability.research, 'funding')) {
					logger.error(
						`research funding missing for Facility ${facility.name} ${facility._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(facility.capability.research, 'sciRate')) {
					logger.error(
						`research sciRate missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else if (isNaN(facility.capability.research.sciRate)) {
					logger.error(
						`research Facility ${facility.name} ${facility._id} research sciRate is not a number ${facility.capability.research.sciRate}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(facility.capability.research, 'sciBonus')) {
					logger.error(
						`research sciBonus missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else if (isNaN(facility.capability.research.sciBonus)) {
					logger.error(
						`research Facility ${facility.name} ${facility._id} research sciBonus is not a number ${facility.capability.research.sciRate}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(facility.capability.research, 'active')) {
					logger.error(
						`research active missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else {
					researchActive = facility.capability.research.active;
				}

				if (!Object.prototype.hasOwnProperty.call(facility.capability.research, 'status')) {
					logger.error(
						`research status missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else {
					if (!Object.prototype.hasOwnProperty.call(facility.capability.research.status, 'damage')) {
						logger.error(
							`research status damage missing for Facility ${facility.name} ${facility._id}`
						);
					}
					if (!Object.prototype.hasOwnProperty.call(facility.capability.research.status, 'pending')) {
						logger.error(
							`research status pending missing for Facility ${facility.name} ${facility._id}`
						);
					}
				}

				if (!Object.prototype.hasOwnProperty.call(facility.capability.research, 'projects')) {
					logger.error(
						`research projects missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else {
					if (facility.capability.research.projects.length > researchCapacity) {
						logger.error(
							`research projects entries exceeds capacity for Facility ${facility.name} ${facility._id}`
						);
					}

					if (
						facility.capability.research.projects.length > 0 &&
            !researchActive
					) {
						logger.error(
							`research projects entries on in-active research for Facility ${facility.name} ${facility._id}`
						);
					}
				}
			}

			if (Object.prototype.hasOwnProperty.call(facility.capability, 'airMission')) {
				let airCapacity = 0;
				let airActive = false;
				if (!Object.prototype.hasOwnProperty.call(facility.capability.airMission, 'capacity')) {
					logger.error(
						`airMission capacity missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else if (isNaN(facility.capability.airMission.capacity)) {
					logger.error(
						`Lab Facility ${facility.name} ${facility._id} airMission capacity is not a number ${facility.capability.airMission.capacity}`
					);
				}
				else {
					airCapacity = facility.capability.airMission.capacity;
				}
				if (!Object.prototype.hasOwnProperty.call(facility.capability.airMission, 'damage')) {
					logger.error(
						`airMission damage missing for Facility ${facility.name} ${facility._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(facility.capability.airMission, 'active')) {
					logger.error(
						`airMission active missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else {
					airActive = facility.capability.airMission.active;
				}

				if (!Object.prototype.hasOwnProperty.call(facility.capability.airMission, 'aircraft')) {
					logger.error(
						`airMission aircraft missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else {
					if (facility.capability.airMission.aircraft.length > airCapacity) {
						logger.error(
							`airMission aircraft entries exceeds capacity for Facility ${facility.name} ${facility._id}`
						);
					}

					if (
						facility.capability.airMission.aircraft.length > 0 &&
            !airActive
					) {
						logger.error(
							`aircraft entries for in-active airMission for Facility ${facility.name} ${facility._id}`
						);
					}
				}
			}

			if (Object.prototype.hasOwnProperty.call(facility.capability, 'storage')) {
				if (!Object.prototype.hasOwnProperty.call(facility.capability.storage, 'capacity')) {
					logger.error(
						`storage capacity missing for Facility ${facility.name} ${facility._id}`
					);
				}
				else if (isNaN(facility.capability.storage.capacity)) {
					logger.error(
						`storage Facility ${facility.name} ${facility._id} capacity is not a number ${facility.capability.storage.capacity}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(facility.capability.storage, 'damage')) {
					logger.error(
						`storage damage missing for Facility ${facility.name} ${facility._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(facility.capability.storage, 'active')) {
					logger.error(
						`storage active missing for Facility ${facility.name} ${facility._id}`
					);
				}
			}
		}

		if (Object.prototype.hasOwnProperty.call(facility.capability, 'manufacturing')) {
			if (!Object.prototype.hasOwnProperty.call(facility.capability.manufacturing, 'capacity')) {
				logger.error(
					`manufacturing capacity missing for Facility ${facility.name} ${facility._id}`
				);
			}
			else if (isNaN(facility.capability.manufacturing.capacity)) {
				logger.error(
					`manufacturing Facility ${facility.name} ${facility._id} capacity is not a number ${facility.capability.manufacturing.capacity}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(facility.capability.manufacturing, 'damage')) {
				logger.error(
					`manufacturing damage missing for Facility ${facility.name} ${facility._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(facility.capability.manufacturing, 'active')) {
				logger.error(
					`manufacturing active missing for Facility ${facility.name} ${facility._id}`
				);
			}
		}

		if (Object.prototype.hasOwnProperty.call(facility.capability, 'ground')) {
			let groundCapacity = 0;
			let groundActive = false;
			if (!Object.prototype.hasOwnProperty.call(facility.capability.ground, 'capacity')) {
				logger.error(
					`ground capacity missing for Facility ${facility.name} ${facility._id}`
				);
			}
			else if (isNaN(facility.capability.ground.capacity)) {
				logger.error(
					`ground Facility ${facility.name} ${facility._id} capacity is not a number ${facility.capability.ground.capacity}`
				);
			}
			else {
				groundCapacity = facility.capability.ground.capacity;
			}
			if (!Object.prototype.hasOwnProperty.call(facility.capability.ground, 'damage')) {
				logger.error(
					`ground damage missing for Facility ${facility.name} ${facility._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(facility.capability.ground, 'active')) {
				logger.error(
					`ground active missing for Facility ${facility.name} ${facility._id}`
				);
			}
			else {
				groundActive = facility.capability.ground.active;
			}

			if (!Object.prototype.hasOwnProperty.call(facility.capability.ground, 'corps')) {
				logger.error(
					`ground corps missing for Facility ${facility.name} ${facility._id}`
				);
			}
			else {
				if (facility.capability.ground.corps.length > groundCapacity) {
					logger.error(
						`ground corps entries exceeds capacity for Facility ${facility.name} ${facility._id}`
					);
				}

				if (facility.capability.ground.corps.length > 0 && !groundActive) {
					logger.error(
						`corps entries for in-active ground for Facility ${facility.name} ${facility._id}`
					);
				}
			}
		}

		if (Object.prototype.hasOwnProperty.call(facility.capability, 'naval')) {
			let navalCapacity = 0;
			let navalActive = false;
			if (!Object.prototype.hasOwnProperty.call(facility.capability.naval, 'capacity')) {
				logger.error(
					`naval capacity missing for Facility ${facility.name} ${facility._id}`
				);
			}
			else if (isNaN(facility.capability.naval.capacity)) {
				logger.error(
					`naval Facility ${facility.name} ${facility._id} capacity is not a number ${facility.capability.naval.capacity}`
				);
			}
			else {
				navalCapacity = facility.capability.naval.capacity;
			}
			if (!Object.prototype.hasOwnProperty.call(facility.capability.naval, 'damage')) {
				logger.error(
					`naval damage missing for Facility ${facility.name} ${facility._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(facility.capability.naval, 'active')) {
				logger.error(
					`naval active missing for Facility ${facility.name} ${facility._id}`
				);
			}
			else {
				navalActive = facility.capability.naval.active;
			}

			if (!Object.prototype.hasOwnProperty.call(facility.capability.naval, 'fleet')) {
				logger.error(
					`naval fleet missing for Facility ${facility.name} ${facility._id}`
				);
			}
			else {
				if (facility.capability.naval.fleet.length > navalCapacity) {
					logger.error(
						`naval fleet entries exceeds capacity for Facility ${facility.name} ${facility._id}`
					);
				}

				if (facility.capability.naval.fleet.length > 0 && !navalActive) {
					logger.error(
						`fleet entries for in-active naval for Facility ${facility.name} ${facility._id}`
					);
				}
			}
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'status')) {
			logger.error(
				`status missing for Facility ${facility.name} ${facility._id}`
			);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(facility.status, 'repair')) {
				logger.error(
					`status.building missing for Facility ${facility.name} ${facility._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(facility.status, 'damaged')) {
				logger.error(
					`status.damaged missing for Facility ${facility.name} ${facility._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(facility.status, 'destroyed')) {
				logger.error(
					`status.destroyed missing for Facility ${facility.name} ${facility._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(facility.status, 'secret')) {
				logger.error(
					`status.secret missing for Facility ${facility.name} ${facility._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(facility.status, 'defenses')) {
				logger.error(
					`status.defenses missing for Facility ${facility.name} ${facility._id}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'hidden')) {
			logger.error(
				`hidden missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'type')) {
			logger.error(
				`type missing for Facility ${facility.name} ${facility._id}`
			);
		}
		else {
			if (!inArray(typeList, facility.type)) {
				logger.error(
					`Invalid type ${facility.type} for Facility ${facility.name} ${facility._id}`
				);
			}

			if (facility.type === 'Base') {
				// nothing to do here yet
			}

			if (facility.type === 'Research') {
				// nothing to do here yet
			}

			if (facility.type === 'Factory') {
				// nothing to do here yet
			}

			if (facility.type === 'Hanger') {
				// only have type field for Hanger currently
			}

			if (facility.type === 'Crisis') {
				// only have type field for Crisis currently
			}

			if (facility.type === 'Civilian') {
				// only have type field for Civilian currently
			}

			if (facility.type === 'Lab') {
				// nothing to do here yet
			}
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initFacilities/validate/${facility._id}`);
			if (!valMessage.data.type) {
				logger.error(`Validation Error For ${facility.code} ${facility.name}: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Facility Validation Error For ${facility.code} ${facility.name} Error: ${err.message}`
			);
		}

	}

	runFlag = true;
	return runFlag;
}

module.exports = chkFacility;
