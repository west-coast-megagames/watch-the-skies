const bodyParser = require('body-parser');

// Error handling and Logging
const { routeError, logger } = require('../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const cors = require('cors');

const auth = require('./auth');

// Log routes - Using Express.js
// Desc - Routes for accessing server errors/info stored in DB
const logError = require('./log/logErrors');
const logInfo = require('./log/logInfo');

// Public Routes - Using Express.js
// Desc - Public Routes host HTML information for people visiting
const home = require('./public/home');

// API Routes - Using Express.js
// Desc - API routes are the raw HTTP GET/POST/DEL access to our models
const article = require('./api/articles');
const aircraft = require('./api/aircrafts');
const account = require('./api/accounts');
const blueprint = require('./api/blueprints');
const country = require('./api/countries');
const facilities = require('./api/facilities');
const logs = require('./api/log');
const military = require('./api/military');
const research = require('./api/research');
const sites = require('./api/sites');
const team = require('./api/team');
const trade = require('./api/trade');
const treaty = require('./api/treaty');
const upgrade = require('./api/upgrade');
const zones = require('./api/zones');
const users = require('./api/users');
// data init and check routes
const initZones = require('./init/initZones');
const initUsers = require('./init/initUsers');
const initTeams = require('./init/initTeams');

// Game Routes - Using Express.js
// Desc - Game routes serve as the HTTP access point to game functions
const admin = require('./game/admin');
const banking = require('./game/banking');
const control = require('./game/control');
const del = require('./game/delete');
const diplomacy = require('./game/diplomacy');
const game = require('./game/game');
const interceptors = require('./game/interceptors');
const milGame = require('./game/milGame');
const news = require('./game/news');
const shared = require('./game/shared');

const debug = require('./debugRoute');

module.exports = function (app) {
	logger.info('Opening routes...');

	// Bodyparser Middleware
	app.use(bodyParser.json());

	// Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
	app.use(cors());

	// Express Routes - Endpoints to connect to through the browser. (Housed routes folder)
	app.use('/', home);

	// app.use('/game', game); //think this is not needed.... -S
	app.use('/game/admin', admin);
	app.use('/game/banking', banking); // Route for banking functions
	app.use('/game/control', control);
	app.use('/game/delete', del);
	app.use('/game/diplomacy', diplomacy);
	app.use('/game/game', game);
	app.use('/game/interceptors', interceptors);
	app.use('/game/milGame', milGame);
	app.use('/game/news', news); // Route for the news desks
	app.use('/game/shared', shared);

	app.use('/debug', debug); // Route for debug triggering

	app.use('/api/accounts', account); // Route for inputing accounts
	app.use('/api/aircrafts', aircraft); // Route for manipulating aircrafts
	app.use('/api/articles', article); // Route for manipulating articles
	app.use('/api/blueprints', blueprint);
	app.use('/api/countries', country); // Route for inputing countries
	app.use('/api/facilities', facilities); // Route for inputing countries
	app.use('/api/logs', logs); // Route for logs
	app.use('/api/military', military); // Route for manipulating militarys
	app.use('/api/research', research); // Route for research functions
	app.use('/api/sites', sites); // Route for sites
	app.use('/api/team', team); // Route for Teams
	app.use('/api/trade', trade); //
	app.use('/api/treaty', treaty); // treaties
	app.use('/api/upgrades', upgrade); // Route for upgrades
<<<<<<< HEAD
	app.use('/init/initZones', initZones); // Route for init/check of zones
	app.use('/init/initUsers', initUsers); // Route for init/check of Users
	app.use('/init/initTeams', initTeams); // Route for init/check of Teams

=======
	app.use('/api/user', users); // Route for dealing with Users
	app.use('/api/zones', zones); // Route for inputing zones

	app.use('/log/logErrors', logError); // Route for manipulating logError
	app.use('/log/logInfo', logInfo); // Route for manipulating logInfo
	app.use('/auth', auth);
>>>>>>> 7e6c6886939ca455c6e5628a51fe6a0d5e99ed83

	app.use(routeError);
};