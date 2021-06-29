/* eslint-disable no-trailing-spaces */
const { logger } = require('../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const config = require('config');
const clock = require('./socket/clock');
const nexusEvent = require('../middleware/events/events');
const masterClock = require('../wts/gameClock/gameClock');

const routes = { clock };

module.exports = function (server) {
	logger.info('Socket.io servers initialized...');
	const io = require('socket.io')(server, {
		cors: {
			origin: config.get('socketCORS'),
			methods: ['GET', 'POST']
		}
	}); // Creation of websocket Server

	io.use((client, next) => {
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
				route(client, req);
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

	nexusEvent.on('broadcast', (data) => {
		let message;
		switch(data.action) {
		case('clock'):
			io.emit('clock', masterClock.getClockState());
			break;
		default:
			message = `No broadcast for ${data.action} event call`;
			throw new Error(message);
		}
	})

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
	// require('./socket/clock')(io);
	// require('./socket/update')(io);
	// require('./socket/main')(io);
	logger.info('Sockets Online...');
};