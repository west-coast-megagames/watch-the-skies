const express = require('express'); // Import of EXPRESS to create routing app
const http = require('http'); // Import of the NODE HTTP module to create the http server
const { logger } = require('./middleware/winston'); // Import of winston for error logging

logger.info('Starting boot-up for WTS Game server...')

require('supports-color'); // Allows colors for debug panel

// Start up proceesses
logger.info('Loading Start-up proceesses...');
const app = express(); // Init for express
logger.info('Express app started...');
const server = http.createServer(app); // Creation of an HTTP server
logger.info('HTTP server created...');
require('./startup/logging')(); // Bootup for error handling
require('./startup/sockets')(server); // Starts websocket
require('./startup/routes')(app); // Bootup for Express routes
require('./startup/db')(); // Bootup of MongoDB through Mongoose
require('./startup/config')(); // Bootup for special configurations
require('./startup/prod')(app); // Production compression and middleware

const port = process.env.PORT || 5000; // Server entry point - Node Server
server.listen(port, () => logger.info(`WTS Server started on port ${port}...`)); //export server object for integration testing

module.exports = server; // Export of Server for JEST testing