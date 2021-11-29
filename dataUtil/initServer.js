const express = require('express');
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const { logger } = require('./middleware/log/winston'); // Import of winston for error logging
// const connect = require('../config/sockets');
const http = require('http');
const initLoadAll = require('./dataInit/initLoadAll');
const initCheckAll = require('./dataCheck/initCheckAll');
const config = require('config');
const axios = require('axios');
const gameServer = require('./config/config').gameServer;

// Middleware - express and socketIo
const app = express();
const server = http.createServer(app);
require('./startup/logging')(); // Bootup for error handling
const { Server } = require("socket.io");
const io = new Server(server);

// DB Config | Saved in the config folder | Mogoose Key
const dbURI = require('./config/keys').mongoURI;
const mongoOptions = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true,
	dbName: config.get('dbName')
};

// Connect to MongoDB with Mongoose
mongoose
	.connect(dbURI, mongoOptions)
	.then(() => dbDebugger(`MongoDB Connected ${config.get('dbName')} ...`))
	.then(() => logger.info(`MongoDB Connected ${config.get('dbName')} ...`));
/* let winston handle it
    .catch(err => console.warn(err));
    */

let loadSel = config.get('loadSel');
if (loadSel == '') {
	loadSel = 'All';
}

// Express Routes - Endpoints to connect to through the browser.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/init', async (req, res) => {
	await initLoadAll(loadSel);
	res.status(200).send('Init Load All Done');
});

app.get('/chk', async (req, res) => {
	await initCheckAll(loadSel);
	res.status(200).send('Init Check All Done');
});

// socketio coding
io.on('connection', async function (socket) {
	const localDB = config.get('dbName');
  console.log(`a user connected ... local db:  ${localDB}   selFiles  ${loadSel}`);

	const { data } = await axios.get(`${gameServer}init/initServerInfo/`);
	const serverDB = data.serverDB;

	headerObj = {utilDB: localDB, selFiles: loadSel, serverDB: serverDB};
	socket.emit('headerInfo', headerObj );             // server-side event

	// server-side handler of client event
	socket.on('doDB', async function(data) {
		console.log(data);
		const { choice, doLoad } = data;
		console.log(choice);
		console.log(doLoad);
		switch (choice) {
			case("initDB"):
			  await initLoadAll(doLoad);
			break;

			case("checkDB"):
			  await initCheckAll(doLoad);

			break;
			default:
        console.log('invalid choice');

		}
 }); 

});

// Server entry point - Node Server
const port = process.env.PORT || 4000;
server.listen(port, () =>
	logger.info(`WTS INIT Server started on port ${port}...`)
);
