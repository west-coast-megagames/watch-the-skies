const socketDebugger = require('debug')('app:sockets');
const { logger } = require('../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling

module.exports = function (server) {
  const io = require('socket.io')(server); // Creation of websocket Server
  
  require('../routes/socket/clock')(io);
  require('../routes/socket/update')(io);
  require('../routes/socket/main')(io);
};