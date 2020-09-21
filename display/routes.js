const bodyParser = require('body-parser');
const cors = require('cors');

// Routes - Using Express
const news = require('./route/news');
const home = require('./route/home');
const zone = require('./route/zone');
const country = require('./route/country');

module.exports = function (app) {
	// Bodyparser Middleware
	app.use(bodyParser.json());

	// Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
	app.use(cors());

	// Express Routes - Endpoints to connect to through the browser. (Housed routes folder)
	app.use('/', home);
	app.use('/news', news); // Route for the news desks
	app.use('/zones', zone); // Route for the zones
	app.use('/country', country); // Route for the countries
};