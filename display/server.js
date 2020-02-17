const express = require('express'); // Import of EXPRESS to create routing app
const http = require('http'); // Import of the NODE HTTP module to create the http server

// Start up proceesses
const app = express(); // Init for express
const server = http.createServer(app); // Creation of an HTTP server
// const io = require('socket.io')(server); // Creation of websocket Server
require('./routes')(app); // Bootup for Express routes
require('./db')(); // Bootup of MongoDB through Mongoose

const port = process.env.PORT || 4000; // Server entry point - Node Server
server.listen(port, () => console.log(`WTS-Display Server started on port ${port}...`)); //export server object for integration testing