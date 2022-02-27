const express = require('express'); // Import of EXPRESS to create routing app
const http = require('http'); // Import of the NODE HTTP module to create the http server
const debug = require('debug')('app:boot'); // Import and initialization of DEBUG console log
const { logger } = require('./middleware/log/winston'); // Import of winston for error logging

logger.info('Starting boot-up for WTS Game server...');

require('supports-color'); // Allows colors for debug console messages

// Start up proceesses
const port = process.env.PORT || 5000; // Server entry point - Node Server
const host = '0.0.0.0'
logger.info('Loading Start-up proceesses...');
debug('Loading Start-up proceesses...');
const app = express(); // Init for express
logger.info('Express app started...');
debug('Express app started...');
const server = http.createServer(app); // Creation of an HTTP server
logger.info('HTTP server created...');
debug('HTTP server created...');

require('./config/config')(); // Bootup for special configurations
require('./middleware/production/prod')(app); // Production compression and middleware
require('./middleware/log/logging')(); // Bootup for error handling
require('./routes/sockets')(server); // Starts websocket
require('./middleware/mongoDB/db')(); // Bootup of MongoDB through Mongoose
require('./middleware/util/changeStream') // Initializes change stream tracking
require('./wts/gameClock/gameClock'); // Initialize the gameClock class
require('./wts/gameClock/phaseChange'); // Initialize the Phase change class

require('./routes/routes')(app); // Bootup for Express routes

app.use(express.static('public'));

// Server listner callback
server.listen(port, host, () => {
	logger.info(`WTS Server started on port ${port}...`);
	debug(`WTS Server started on port ${port}...`);
});

debug('WTS Server load completed!');

module.exports = server; // Export of Server for JEST testing