/* eslint-disable no-trailing-spaces */
const { logger } = require('../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling

module.exports = function (server) {
	logger.info('Activating Sockets...');
	const io = require('socket.io')(server); // Creation of websocket Server
  
	require('./socket/clock')(io);
	require('./socket/update')(io);
	require('./socket/main')(io);
	logger.info('Sockets Open...');
};