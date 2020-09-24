const bodyParser = require('body-parser');

// Error handling and Logging
const { routeError, logger } = require('../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const cors = require('cors');

const auth = require('./auth');

// Public Routes - Using Express
// Desc - Public Routes host HTML information for people visiting
const home = require('./public/home');

// API Routes - Using Express
// Desc - API routes are the raw HTTP GET/POST/DEL access to our models
const article = require('./api/articles');
const aircraft = require('./api/aircrafts');
const account = require('./api/accounts');
const country = require('./api/country');
const facilities = require('./api/facilities');
const intercept = require('./api/intercept');
const logs = require('./api/log');
const logError = require('./log/logErrors');
const logInfo = require('./log/logInfo');
const military = require('./api/military');
const news = require('./api/news');
const research = require('./api/research');
const sites = require('./api/sites');
const team = require('./api/team');
const trade = require('./api/trade');
const treaty = require('./api/treaty');
const upgrade = require('./api/upgrade');
const zones = require('./api/zones');

// Game Routes - Using Express
// Desc - Game routes serve as the HTTP access point to game functions
const debug = require('./debugRoute');
const game = require('./game/game');
const admin = require('./game/admin');
const del = require('./game/delete');
const banking = require('./game/banking');
const control = require('./game/control');

const users = require('./api/users');

// const initData = require('../routes/api/initData');


module.exports = function (app) {
	logger.info('Opening routes...');

	// Bodyparser Middleware
	app.use(bodyParser.json());

	// Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
	app.use(cors());

	// Express Routes - Endpoints to connect to through the browser. (Housed routes folder)
	app.use('/', home);
	app.use('/debug', debug); // Route for debug triggering
	app.use('/game', game);
	app.use('/game/admin', admin);
	app.use('/game/delete', del);
	app.use('/api/auth', auth);
	app.use('/api/aircrafts', aircraft); // Route for manipulating aircrafts
	app.use('/api/team', team); // Route for Teams
	app.use('/api/intercept', intercept); // Route for triggering an interception
	app.use('/api/zones', zones); // Route for inputing zones
	app.use('/api/country', country); // Route for inputing countries
	app.use('/api/facilities', facilities); // Route for inputing countries
	app.use('/api/sites', sites); // Route for sites
	app.use('/api/accounts', account); // Route for inputing accounts
	app.use('/api/user', users); // Route for dealing with Users
	app.use('/api/news', news); // Route for the news desks
	app.use('/api/logs', logs); // Route for logs
	app.use('/api/banking', banking); // Route for banking functions
	app.use('/api/research', research); // Route for research functions
	app.use('/api/military', military); // Route for manipulating militarys
	app.use('/api/articles', article); // Route for manipulating articles
	app.use('/api/logErrors', logError); // Route for manipulating logError
	app.use('/api/logInfo', logInfo); // Route for manipulating logInfo
	app.use('/api/trade', trade); //
	app.use('/api/treaty', treaty); // treaties
	// app.use('/api/initData', initData); // Route for Init Data functions
	app.use('/api/upgrades', upgrade); // Route for upgrades

	app.use('/api/control', control);
	app.use(routeError);
};