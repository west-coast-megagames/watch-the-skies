const express = require('express');
const http = require('http');
const { logger } = require('./middleware/winston');

require('supports-color');

// Import of the temparary Alert socket route for v0.1.1
const { alerts } = require('./wts/notifications/alerts');

// Start up proceesses
const app = express(); // Init for express
const server = http.createServer(app); // Creation of an HTTP server
const io = require('socket.io')(server); // Creation of websocket Server

require('./startup/logging')(); // Bootup for error handling
require('./startup/routes')(app); // Bootup for Express routes
require('./startup/db')(); // Bootup of MongoDB through Mongoose
require('./startup/config')(); // Bootup for special configurations
require('./startup/prod')(app); // Production compression and middleware
require('./config/sockets')(io); // Main websocket routes
// Socket.io routes are currently housed in config/sockets.js)
alerts(io); // Temp alert route for v0.1.1

const port = process.env.PORT || 5000; // Server entry point - Node Server
server.listen(port, () => logger.info(`WTS Server started on port ${port}...`)); //export server object for integration testing

module.exports = server;