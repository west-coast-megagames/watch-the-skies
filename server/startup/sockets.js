/* eslint-disable no-trailing-spaces */
const { logger } = require('../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling

module.exports = function (server) {
	logger.info('Activating Sockets...');
	const io = require('socket.io')(server); // Creation of websocket Server
  
	require('../routes/socket/clock')(io);
	require('../routes/socket/update')(io);
	require('../routes/socket/main')(io);
	logger.info('Sockets Open...');
};