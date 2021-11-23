// Error handling and Logging
const { routeError, logger } = require('../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const debugBoot = require('debug')('app:boot');
const cors = require('cors');

// Log routes - Using Express.js
// Desc - Routes for accessing server errors/info stored in DB
const logError = require('./log/logErrors');
const logInfo = require('./log/logInfo');
debugBoot('Logger routes initiated...');
// Public Routes - Using Express.js
// Desc - Public Routes host HTML information for people visiting
const home = require('./public/home');
debugBoot('Public routes initiated...');

// API Routes - Using Express.js
// Desc - API routes are the raw HTTP GET/POST/DEL access to our models
const article = require('./api/articles');
const aircraft = require('./api/aircrafts');
const account = require('./api/accounts');
const blueprint = require('./api/blueprints');
const clock = require('./api/clock');
const organization = require('./api/organizations');
const facilities = require('./api/facilities');
const reports = require('./api/reports');
const military = require('./api/military');
const squad = require('./api/squad');
const research = require('./api/research');
const sites = require('./api/sites');
const team = require('./api/team');
const trade = require('./api/trade');
const treaty = require('./api/treaty');
const upgrade = require('./api/upgrade');
const zones = require('./api/zones');
const logerrors = require('./api/logerrors');
const intel = require('./api/intel');
debugBoot('API routes initiated...');

// data init and check routes
const initZones = require('./init/initZones');
const initTeams = require('./init/initTeams');
const initOrganizations = require('./init/initOrganizations');
const initBlueprints = require('./init/initBlueprints');
const initSites = require('./init/initSites');
const initFacilities = require('./init/initFacilities');
const initAircrafts = require('./init/initAircrafts');
const initAccounts = require('./init/initAccounts');
const initMilitaries = require('./init/initMilitaries');
const initSquads = require('./init/initSquads');
const initUpgrades = require('./init/initUpgrades');
const initArticles = require('./init/initArticles');
const initResearch = require('./init/initResearch');
const initTrades = require('./init/initTrades');
const initTreaties = require('./init/initTreaties');
debugBoot('INIT routes initiated...');

// Game Routes - Using Express.js
// Desc - Game routes serve as the HTTP access point to game functions
const admin = require('./game/admin');
const control = require('./game/control');
const diplomacy = require('./game/diplomacy');
const science = require('./game/science');
const aircrafts = require('./game/aircrafts');
const news = require('./game/news');
const shared = require('./game/shared');
const upgrades = require('./game/upgrades');
const tempMil = require('./game/tempMil');
const debug = require('./debugRoute');
const express = require('express');
debugBoot('Game routes initiated...')

module.exports = function (app) {
	logger.info('Opening routes...');
	debugBoot('Opening routes...');

	app.use(express.json());

	// Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
	app.use(cors());

	// Express Routes - Endpoints to connect to through the browser. (Housed routes folder)
	app.use('/', home);
	app.use('/game/admin', admin);
	app.use('/game/control', control);
	app.use('/game/diplomacy', diplomacy);
	app.use('/game/upgrades', upgrades);
	app.use('/science', science);
	app.use('/game/aircrafts', aircrafts);
	app.use('/game/news', news); // Route for the news desks
	app.use('/game/shared', shared);
	app.use('/debug', debug); // Route for debug triggering
	app.use('/api/accounts', account); // Route for inputing accounts
	app.use('/api/clock', clock); // Route for inputing accounts
	app.use('/api/aircrafts', aircraft); // Route for manipulating aircrafts
	app.use('/api/articles', article); // Route for manipulating articles
	app.use('/api/blueprints', blueprint);
	app.use('/api/organizations', organization); // Route for inputing organizations
	app.use('/api/facilities', facilities); // Route for inputing organizations
	app.use('/api/reports', reports); // Route for reports
	app.use('/api/military', military); // Route for manipulating militarys
	app.use('/api/squad', squad); // Route for manipulating squad
	app.use('/api/research', research); // Route for research functions
	app.use('/api/sites', sites); // Route for sites
	app.use('/api/team', team); // Route for Teams
	app.use('/api/trade', trade); //
	app.use('/api/treaty', treaty); // treaties
	app.use('/api/upgrades', upgrade); // Route for upgrades
	app.use('/api/logerrors', logerrors); // Route for logerrors
	app.use('/api/intel', intel); // Route for intels
	app.use('/init/initZones', initZones); // Route for init/check of zones
	app.use('/init/initTeams', initTeams); // Route for init/check of Teams
	app.use('/init/initOrganizations', initOrganizations); // Route for init/check of Organizations
	app.use('/init/initBlueprints', initBlueprints); // Route for init/check of Blueprints
	app.use('/init/initSites', initSites); // Route for init/check of Sites
	app.use('/init/initFacilities', initFacilities); // Route for init/check of Facilities
	app.use('/init/initAircrafts', initAircrafts); // Route for init/check of Aircraft
	app.use('/init/initAccounts', initAccounts); // Route for init/check of Accounts
	app.use('/init/initMilitaries', initMilitaries); // Route for init/check of Military
	app.use('/init/initUpgrades', initUpgrades); // Route for init/check of Upgrades
	app.use('/init/initSquads', initSquads); // Route for init/check of Squad
	app.use('/init/initArticles', initArticles); // Route for init/check of Articles
	app.use('/init/initResearch', initResearch); // Route for init/check of Research
	app.use('/init/initTrades', initTrades); // Route for init/check of Trades
	app.use('/init/initTreaties', initTreaties); // Route for init/check of Treaties

	app.use('/game/tempMil', tempMil);

	app.use('/api/zones', zones); // Route for inputing zones

	app.use('/log/logErrors', logError); // Route for manipulating logError
	app.use('/log/logInfo', logInfo); // Route for manipulating logInfo

	app.use(routeError);
};