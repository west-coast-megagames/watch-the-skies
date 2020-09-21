const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
const config = require('config');

module.exports = function () {
	logger.info('Loading Config module...');
	if (!config.get('jwtPrivateKey')) {
		throw new Error('FATAL ERROR: jwtPrivateKey is not defined...');
	}
};