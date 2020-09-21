const helmet = require('helmet');
const compression = require('compression');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging

module.exports = function (app) {
	app.use(helmet());
	app.use(compression());
	logger.info('Loading Compression Module...');
};