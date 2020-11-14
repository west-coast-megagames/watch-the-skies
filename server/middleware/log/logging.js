module.exports = function () {
	// Error handling and Logging
	const error = require('./winston'); // middleware/error.js which is running [npm] winston for error handling
	const debug = require('debug')('app:boot');
	require('express-async-errors'); // [npm] express-async-errors, used to do try/catch error handling

	error.logger.info('Loading Logger Module...');
	debug('Loading Logger Module...');
	// Add in Error handling for uncought exceptions
	process.on('uncaughtException', (err) => {
		error.logger.error(`${err.message}`, { meta: err.stack });
		// process.exit(1);
	});

	// Add in Error handling for unhandled Promise rejections
	process.on('unhandledRejection', (err) => {
		error.logger.error(`${err.message}`, { meta: err.stack });
		// process.exit(1);
	});
};