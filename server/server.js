const express = require('express'); // Import of EXPRESS to create routing app
const http = require('http'); // Import of the NODE HTTP module to create the http server
const debug = require('debug')('app:boot'); // Import and initialization of DEBUG console log
const { logger } = require('./middleware/log/winston'); // Import of winston for error logging

logger.info('Starting boot-up for WTS Game server...');

require('supports-color'); // Allows colors for debug console messages

// Start up proceesses
const port = process.env.PORT || 5000; // Server entry point - Node Server
logger.info('Loading Start-up proceesses...');
debug('Loading Start-up proceesses...');
const app = express().listen(port, ); // Init for express
logger.info('Express app started...');
debug('Express app started...');
const server = http.createServer(app); // Creation of an HTTP server
// Server listner callback
server.listen(port, () => {
	logger.info(`WTS Server started on port ${port}...`);
	debug(`WTS Server started on port ${port}...`);
});
logger.info('HTTP server created...');
debug('HTTP server created...');

require('./middleware/log/logging')(); // Bootup for error handling
require('./routes/sockets')(server); // Starts websocket
require('./routes/routes')(app); // Bootup for Express routes
require('./middleware/mongoDB/db')(); // Bootup of MongoDB through Mongoose
require('./config/config')(); // Bootup for special configurations
require('./middleware/production/prod')(app); // Production compression and middleware
require('./wts/gameClock/gameClock'); // Initialize the gameClock class
require('./wts/gameClock/phaseChange'); // Initialize the Phase change class

app.use(express.static('public'));

debug('WTS Server load completed!');

module.exports = server; // Export of Server for JEST testing