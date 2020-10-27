const helmet = require('helmet');
const compression = require('compression');
const debug = require('debug')('app:boot');
const { logger } = require('../log/winston'); // Import of winston for error logging

module.exports = function (app) {
	app.use(helmet());
	app.use(compression());
	logger.info('Loading Compression Module...');
	debug('Loading Compression Module...');
};