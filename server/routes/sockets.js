/* eslint-disable no-trailing-spaces */
const { logger } = require('../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const config = require('config'); // Import of config modules to pull config variables

const nexusEvent = require('../middleware/events/events'); // Local NODE event trigger
const masterClock = require('../wts/gameClock/gameClock'); // Import of main clock class

const transaction = require('./socket/transactions'); // Import of Socket route for WTS Transaction system
const clock = require('./socket/clock'); // Import of Socket route for WTS Clock controls
const trade = require('./socket/trade'); // Import of Socket route for WTS Clock controls
const governance = require('./socket/governance'); // Governance sockets
const military = require('./socket/military') // Military sockets

const routes = { clock, governance, military, transaction, trade }; // Route object for routing to various socket routes

// Function for initializing the Socket.io socket server
module.exports = function (server) {
	logger.info('Socket.io servers initialized...');
	const io = require('socket.io')(server, {
		cors: {
			origin: config.get('socketCORS'),
			methods: ['GET', 'POST']
		}
	}); // Creation of websocket Server

	io.use((client, next) => {
		//     console.log(client.handshake);
		const { username, character, version } = client.handshake.auth;
		if (!username) return next(new Error('Invalid Username'));
		client.username = username;
		client.character = character;
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
			if (sock.character === data.characterName) socket = sock;
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
			console.log(`Error: ${req} was not found in nexusEvent`); // phaseChange
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
				character: socket.character ? socket.character : 'Unassigned',
				clientVersion: socket.version ? socket.version : 'Old Client'
			});
		}
		io.emit('clients', users);
	}
	// require('./socket/update')(io);
	// require('./socket/main')(io);
	logger.info('Sockets Online...');
};