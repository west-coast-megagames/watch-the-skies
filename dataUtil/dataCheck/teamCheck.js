const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

// National, Alien, Media, Control, ncP
const teamTypeVals = ['National', 'Alien', 'Media', 'Control', 'Npc'];

function inArray(array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkTeam(runFlag) {
	// get accounts once
	let aFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}api/accounts/`);
		aFinds = data;
	}
	catch(err) {
		logger.error(`Accounts Get Error (teamCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	let tFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initTeams/lean`);
		tFinds = data;
	}
	catch(err) {
		logger.error(`Team Get Lean Error (teamCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const team of tFinds) {

		if (!Object.prototype.hasOwnProperty.call(team, 'model')) {
			logger.error(`model missing for team ${team.name} ${team._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(team, 'serviceRecord')) {
			logger.error(`serviceRecord missing for Team ${team.name} ${team._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(team, 'agreements')) {
			logger.error(`agreements missing for Team ${team.name} ${team._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(team, 'name')) {
			logger.error(`name missing for team ${team._id}`);
		}
		else if (team.name === '' || team.name == undefined || team.name == null) {
			logger.error(`name is blank for Team ${team.code} ${team._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(team, 'shortName')) {
			logger.error(`shortName missing for team ${team.name} ${team._id}`);
		}
		else if (
			team.shortName === '' ||
        team.shortName == undefined ||
        team.shortName == null
		) {
			logger.error(`shortName is blank for Team ${team.name} ${team._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(team, 'code')) {
			logger.error(`code missing for team ${team.name} ${team._id}`);
		}
		else if (
			team.code === '' ||
      team.code == undefined ||
      team.code == null
		) {
			logger.error(`code is blank for Team ${team.name} ${team._id}`);
		}

		// should be 6 accounts for each team
		let accountCount = 0;
		const teamId = team._id;
		for (let j = 0; j < aFinds.length; ++j) {
			let aTeamId = undefined;
			if (aFinds[j].team) {
				aTeamId = aFinds[j].team._id;
			}
			if (aTeamId === teamId) {
				++accountCount;
			}
		}

		if (accountCount != 6) {
			logger.error(`Not 6 Accounts for team ${team.code} ${team.name}`);
		}

		if (!Object.prototype.hasOwnProperty.call(team, 'type')) {
			logger.error(`type missing for team ${team.name} ${team._id}`);
		}
		else {
			if (!inArray(teamTypeVals, team.type)) {
				logger.error(
					`Invalid type ${team.type} for Team ${team.name} ${team._id}`
				);
			}

			if (team.type === 'National') {

				if (!Object.prototype.hasOwnProperty.call(team, 'prTrack')) {
					logger.error(
						`prTrack missing for National Team ${team.name} ${team._id}`
					);
				}
				else {
					if (team.prTrack.length < 9) {
						logger.error(
							`National Team ${team.name} ${team._id} prTrack is fewer than 9 ${team.prTrack}`
						);
					}

					if (team.prTrack[0] != 0) {
						logger.error(
							`National Team ${team.name} ${team._id} prTrack first element is not zero ${team.prTrack[0]}`
						);
					}

					for await (const prTrk of team.prTrack) {
						if (isNaN(prTrk)) {
							logger.error(
								`National Team ${team.name} ${team._id} prTrack is not a number ${prTrk}`
							);
						}
					}
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'roles')) {
					logger.error(
						`roles missing for National Team ${team.name} ${team._id}`
					);
				}
				else if (team.roles.length < 1) {
					logger.error(
						`No roles assigned for National Team ${team.name} ${team._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'sciRate')) {
					logger.error(
						`sciRate missing for National Team ${team.name} ${team._id}`
					);
				}
				else if (isNaN(team.sciRate)) {
					logger.error(
						`National Team ${team.name} ${team._id} sciRate is not a number ${team.sciRate}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'agents')) {
					logger.error(
						`agents missing for National Team ${team.name} ${team._id}`
					);
				}
				else if (isNaN(team.agents)) {
					logger.error(
						`National Team ${team.name} ${team._id} agents is not a number ${team.agents}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'prLevel')) {
					logger.error(
						`prLevel missing for National Team ${team.name} ${team._id}`
					);
				}
				else if (isNaN(team.prLevel)) {
					logger.error(
						`National Team ${team.name} ${team._id} prLevel is not a number ${team.prLevel}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'users')) {
					logger.error(
						`users missing for National Team ${team.name} ${team._id}`
					);
				}
				else if (team.users.length < 1) {
					logger.error(
						`No users assigned for National Team ${team.name} ${team._id}`
					);
				}
			}

			if (team.type === 'Alien') {
				if (!Object.prototype.hasOwnProperty.call(team, 'roles')) {
					logger.error(`roles missing for Alien Team ${team.name} ${team._id}`);
				}
				else if (team.roles.length < 1) {
					logger.error(
						`No roles assigned for Alien Team ${team.name} ${team._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'sciRate')) {
					logger.error(
						`sciRate missing for Alien Team ${team.name} ${team._id}`
					);
				}
				else if (isNaN(team.sciRate)) {
					logger.error(
						`Alien Team ${team.name} ${team._id} sciRate is not a number ${team.sciRate}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'agents')) {
					logger.error(
						`agents missing for Alien Team ${team.name} ${team._id}`
					);
				}
				else if (isNaN(team.agents)) {
					logger.error(
						`Alien Team ${team.name} ${team._id} agents is not a number ${team.agents}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'actionPts')) {
					logger.error(
						`actionPts missing for Alien Team ${team.name} ${team._id}`
					);
				}
				else if (isNaN(team.actionPts)) {
					logger.error(
						`Alien Team ${team.name} ${team._id} actionPts is not a number ${team.agents}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'users')) {
					logger.error(
						`users missing for Alien Team ${team.name} ${team._id}`
					);
				}
				else if (team.users.length < 1) {
					logger.error(
						`No users assigned for Alien Team ${team.name} ${team._id}`
					);
				}
			}

			if (team.type === 'Control') {
				if (!Object.prototype.hasOwnProperty.call(team, 'roles')) {
					logger.error(
						`roles missing for Control Team ${team.name} ${team._id}`
					);
				}
				else if (team.roles.length < 1) {
					logger.error(
						`No roles assigned for Control Team ${team.name} ${team._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'sciRate')) {
					logger.error(
						`sciRate missing for Control Team ${team.name} ${team._id}`
					);
				}
				else if (isNaN(team.sciRate)) {
					logger.error(
						`Control Team ${team.name} ${team._id} sciRate is not a number ${team.sciRate}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'users')) {
					logger.error(
						`users missing for Control Team ${team.name} ${team._id}`
					);
				}
				else if (team.users.length < 1) {
					logger.error(
						`No users assigned for Control Team ${team.name} ${team._id}`
					);
				}
			}

			if (team.type === 'Media') {
				if (!Object.prototype.hasOwnProperty.call(team, 'roles')) {
					logger.error(
						`roles missing for Media Team ${team.name} ${team._id}`
					);
				}
				else if (team.roles.length < 1) {
					logger.error(
						`No roles assigned for Media Team ${team.name} ${team._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'agents')) {
					logger.error(
						`agents missing for Media Team ${team.name} ${team._id}`
					);
				}
				else if (isNaN(team.agents)) {
					logger.error(
						`Media Team ${team.name} ${team._id} agents is not a number ${team.agents}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(team, 'users')) {
					logger.error(
						`users missing for Media Team ${team.name} ${team._id}`
					);
				}
				else if (team.users.length < 1) {
					logger.error(
						`No users assigned for Media Team ${team.name} ${team._id}`
					);
				}
			}

			if (team.type === 'Npc') {
				// nothing to check for NPC
			}
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initTeams/validate/${team._id}`);
			if (!valMessage.data.type) {
				logger.error(`Validation Error For ${team.code} ${team.name}: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Team Validation Error For ${team.code} ${team.name} Error: ${err.message}`
			);
		}
	}
	runFlag = true;
	return runFlag;
}

module.exports = chkTeam;
