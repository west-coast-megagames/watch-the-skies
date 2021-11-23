/* eslint-disable no-trailing-spaces */
const { logger } = require('../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const debug = require('debug')('app:boot'); // Import and initialization of DEBUG console log
const config = require('config'); // Import of config modules to pull config variables

const nexusEvent = require('../middleware/events/events'); // Local NODE event trigger

const transaction = require('./socket/transaction'); // Import of Socket route for WTS Transaction system
const clock = require('./socket/clock'); // Import of Socket route for WTS Clock controls
const trade = require('./socket/trade'); // Import of Socket route for WTS Clock controls
const treaty = require('./socket/treaty'); // Treaty sockets
const military = require('./socket/military'); // Military sockets
const article = require('./socket/article'); // News sockets
const aircraft = require('./socket/aircraft'); // Aircraft sockets
const wmd = require('./socket/wmd'); // WMD sockets
const squad = require('./socket/squad'); // Squad sockets
const construction = require('./socket/construction'); // Construction sockets
const resource = require('./socket/resource'); // Resource sockets
const resolution = require('./socket/resolution'); // Resoulution sockets
const research = require('./socket/research'); // Research sockets
const site = require('./socket/site'); // Site sockets
const facility = require('./socket/facility'); // Facility sockets
const team = require('./socket/team');

const routes = { clock, treaty, military, transaction, trade, article, aircraft, wmd, squad, construction, resource, resolution, research, site, facility, team }; // Route object for routing to various socket routes

// Function for initializing the Socket.io socket server
module.exports = function (server) {
	logger.info('Socket.io servers initialized...');
	debug('Socket.io servers initialized...');
	const io = require('socket.io')(server, {
		cors: {
			origin: config.get('socketCORS'),
			methods: ['GET', 'POST']
		}
	}); // Creation of websocket Server

	io.use((client, next) => {
		//     console.log(client.handshake);
		const { username, team: teamName, version } = client.handshake.auth;
		if (!username) return next(new Error('Invalid Username'));
		console.log(`${username} connected - Client v${version} | Team: ${teamName}`);
		client.username = username;
		client.team = teamName;
		client.version = version;
		next();
	});

	io.on('connection', client => {
		console.log(`${client.username} connected (${client.id}), ${io.of('/').sockets.size} clients connected.`);
		client.emit('alert', { type: 'success', message: `${client.username} Connected to WTS server...` });
		currentUsers();

		client.on('request', (req) => {
			// Request object: { route, action, data }
			if (!req.route) {
				client.emit('alert', { type: 'error', message: 'Socket Request missing a route...' });
			}
			else if (!req.action) {
				client.emit('alert', { type: 'error', message: 'Socket Request missing an action type...' });
			}
			else {
				const route = routes[req.route];
				route ? route(client, req) : console.log(`Invalid route call: ${req.route}`);
			}
		});

		// Logout Listner - Disconnects the socket when someone logs out...
		client.on('logout', () => {
			console.log(`${client.username} disconnected (${client.id}), ${io.of('/').sockets.size} clients connected.`);
			io.to(client.id).emit('alert', { type: 'info', message: `${client.username} Logged out...` });
			client.disconnect();
			currentUsers();
		});

		client.on('disconnecting', reason => {
			console.log(client.rooms);
			console.log(reason);
		});

		client.on('disconnect', () => {
			console.log(`${client.username} (${client.id}) disconnected from socket, ${io.of('/').sockets.size} clients connected.`);
			currentUsers();
		});
	});

	nexusEvent.on('request', async (req, data) => {
		const socketArray = Array.from(io.sockets.sockets.values());
		let socket = null;
		for (const sock of socketArray) {
			if (sock.team === data.team) socket = sock;
		}
		switch(req) {
		case 'update':
			io.emit('updateClients', data);
			break;
		case 'create':
			io.emit('createClients', data);
			break;
		case 'delete':
			io.emit('deleteClients', data);
			break;
		case'clock':
			io.emit('updateClients', data);
			break;
		case 'broadcast':
			socket ? socket.emit('alert', data) : console.log(`${data.characterName} was not online to get their mail`);
			break;
		default: 
			console.log(`Error: ${req} was not found in nexusEvent request call`);
		}
	});

	nexusEvent.on('broadcast', (data) => {
		let message;
		switch(data.action) {
		default:
			message = `No broadcast for ${data.action} event call`;
			throw new Error(message);
		}
	});

	function currentUsers() {
		const users = [];
		for (const [id, socket] of io.of('/').sockets) {
			users.push({
				userID: id,
				username: socket.username,
				team: socket.team ? socket.team : 'Unassigned',
				clientVersion: socket.version ? socket.version : 'Old Client'
			});
		}
		io.emit('clients', users);
	}

	logger.info('Sockets Online...');
	debug('Sockets Online...');
};