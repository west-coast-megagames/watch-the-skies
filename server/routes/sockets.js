/* eslint-disable no-trailing-spaces */
const { logger } = require('../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const debug = require('debug')('app:boot');

module.exports = function (server) {
	logger.info('Activating Sockets...');
	debug('Activating Sockets...');
	const io = require('socket.io')(server); // Creation of websocket Server
  
	require('./socket/clock')(io);
	require('./socket/update')(io);
	require('./socket/main')(io);
	logger.info('Sockets Open...');
	debug('Sockets Open...');
};