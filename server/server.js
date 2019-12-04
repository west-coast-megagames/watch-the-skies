const express = require('express');
const http = require('http');
const { logger } = require('./middleware/winston');

require('supports-color');
const cors = require('cors');

// Import of the temparary Alert socket route for v0.1.1
const { alerts } = require('./util/systems/notifications/alerts');

// Start up proceesses
const app = express();
require('./startup/logging')(); // Bootup for error handling
require('./startup/routes')(app); // Bootup for Express routes
require('./startup/db')(); // Bootup of MongoDB through Mongoose
require('./startup/config')(); // Bootup for special configurations

const server = http.createServer(app); // Creation of an HTTP server
const io = require('socket.io')(server); // Creation of websocket Server

// Socket.io routes (Currently housed in config/sockets.js)
require('./config/sockets')(io); // Main websocket routes
alerts(io); // Temp alert route for v0.1.1

// Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
app.use(cors());

// Server entry point - Node Server
const port = process.env.PORT || 5000;
server.listen(port, () => logger.info(`WTS Server started on port ${port}...`));