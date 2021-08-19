const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initAccounts.json',
	'utf8'
);
const accountDataIn = JSON.parse(file);
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function runAccountLoad(runFlag) {
	if (!runFlag) return false;
	if (runFlag) await initLoad(runFlag);
	return true;
}

const accounts = [];

async function loadAccounts() {
	let count = 0;

	for await (const acct of accountDataIn) {

		const newAccount = {
			name: acct.name,
			code: acct.code,
			balance: acct.balance
		};

		accounts[count] = newAccount;
		count++;
	}

	logger.info(`${count} generic accounts available for loading`);
}

async function initLoad(doLoad) {
	if (!doLoad) return;

	// load generic accounts json records into internal array
	await loadAccounts();

	// delete ALL old data
	await deleteAccount();

	let totRecReadCount = 0;
	const totRecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	// create accounts for each team

	const { data } = await axios.get(`${gameServer}api/team/`);

	for await (const team of data) {
		const found_team_id = team._id;
		const found_owner = team.shortName;

		let recReadCount = 0;
		const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

		for (let i = 0; i < accounts.length; ++i) {
			++recReadCount;
			await loadAccount(found_team_id, found_owner, accounts[i], recCounts);
		}
		totRecReadCount += recReadCount;
		totRecCounts.loadCount += recCounts.loadCount;
		totRecCounts.loadErrCount += recCounts.loadErrCount;
		totRecCounts.updCount += recCounts.updCount;

		logger.info(
			`Account Load Counts For Team ${found_owner} Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
		);
	}
	logger.info(
		`Total Account Load Counts Read: ${totRecReadCount} Errors: ${totRecCounts.loadErrCount} Saved: ${totRecCounts.loadCount} Updated: ${totRecCounts.updCount}`
	);
}

async function loadAccount(t_id, tName, aData, rCounts) {
	let loadName = '';

	try {
		const bigCode = aData.code.toUpperCase();

		const { data } = await axios.get(`${gameServer}init/initAccounts/teamacct/${t_id}/${bigCode}`);

		loadName = aData.name + ' ' + tName;

		if (!data.owner) {
			// New Account here
			const newAccount = {
				code: bigCode,
				name: aData.name,
				balance: aData.balance,
				owner: tName,
				team: t_id,
				resources: [],
				gameState: [],
				queue: []
			};
			const resource = 'Megabucks';
			newAccount.resources.push({ type: resource, balance: aData.balance });
			try {
				await axios.post(`${gameServer}api/accounts`, newAccount);
				++rCounts.loadCount;
				logger.debug(`${loadName} add saved to Account collection.`);
			}
			catch (err) {
				++rCounts.loadErrCount;
				logger.error(`New Account Save Error: ${err.message}`, { meta: err.stack });
			}
		}
		else {
			// Existing Account here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Team/Account skipped as account already exists in database: ${loadName}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Account Error: ${err.message}`, { meta: err });
		return;
	}
}

async function deleteAccount() {
	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/accounts/deleteAll/`);
		}
		catch (err) {
			logger.error(`Catch deleteAll Accounts Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Accounts succesfully deleted. (accountLoad');
		}
		else {
			logger.error('Some Error In Account delete (accountLoad):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAll Accounts (accountLoad) Error 2: ${err.message}`, { meta: err.stack });
	}
}

module.exports = runAccountLoad;
