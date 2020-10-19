const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initUser.json',
	'utf8'
);
const userDataIn = JSON.parse(file);
// const mongoose = require('mongoose');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const express = require('express');
const bodyParser = require('body-parser');
// const bcrypt = require('bcryptjs');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runUserLoad (runFlag) {
	try {
		if (!runFlag) return false;
		if (runFlag) {
			await deleteAllUsers();
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`Catch runUserLoad Error: ${err.message}`, { meta: err });
		return false;
	}
}

async function initLoad (doLoad) {
	if (!doLoad) return;

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };
	for await (const data of userDataIn) {
		++recReadCount;
		await loadUser(data, recCounts);
	}
	logger.info(
		`User Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadUser (iData, rCounts) {
	let loadName = '';
	let loadCode = '';
	let loadError = false;
	let loadErrorMsg = '';

	try {
		// handled on axios call now
		// const salt = await bcrypt.genSalt(10);
		// password: await bcrypt.hash(iData.password, salt),

		const { data } = await axios.get(`${gameServer}init/initUsers/username/${iData.username}`);
		loadName = iData.name;
		loadCode = iData.username;

		if (!data.username) {
			// New User here
			const convDate = new Date(iData.dob);
			const user = {
				username: iData.username,
				email: iData.email,
				phone: iData.phone,
				gender: iData.gender,
				discord: iData.discord,
				address: iData.address,
				dob: convDate,
				password: iData.password,
				name: {
					first: iData.name.first,
					last: iData.name.last
				},
				roles: iData.roles,
				gameState: [],
				serviceRecord: []
			};

			if (iData.teamCode != '') {

				const tData = await axios.get(`${gameServer}init/initTeams/code/${iData.teamCode}`);
				const team = tData.data;
				if (!team) {
					loadError = true;
					loadErrorMsg = `User Load Team Error, New User: ${iData.username} Team: ${iData.username} `;
					logger.error(`${loadErrorMsg}`);
				}
				else {
					user.team = team._id;
				}
			}

			// userLoadDebugger("Before Save ... New user.name", user.name.first, "address street1", user.address.street1, user.dob);
			if (!loadError) {
				try {
					await axios.post(`${gameServer}api/user`, user);
					++rCounts.loadCount;
					logger.debug(`${user.username} saved to user collection.`);
					return;
				}
				catch (err) {
					++rCounts.loadErrCount;
					logger.error(`New User Save Error: ${err}`, { meta: err });
					return;
				}
			}
			else {
				logger.error(`User skipped due to errors: ${loadName} ${loadErrorMsg}`);
				++rCounts.loadErrCount;
				return;
			}
		}
		else {
			// Existing User here ... no longer doing updates so this is now counted as an error
			logger.error(
				`User skipped as username already exists in database: ${loadName} ${loadCode}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch User Error: ${err.message}`, { meta: err });
		return;
	}
}

async function deleteAllUsers () {

	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/user/deleteAll`);
		}
		catch (err) {
			logger.error(`User Delete All Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Users succesfully deleted. (userLoad');
		}
		else {
			logger.error('Some Error In User delete all (userLoad');
		}
	}
	catch (err) {
		logger.error(`Delete All Users Catch Error 2: ${err.message}, { meta: err }`);
	}
}

module.exports = runUserLoad;
