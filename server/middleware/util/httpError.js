const { logger } = require('../log/winston');

function httpErrorHandler (res, err) {
	logger.error(err.message, { meta: err.stack });
	let type = 'Server Error';
	switch (err.status) {
	case (400):
		type = 'Bad Request';
		break;
	case (401):
		type = 'Unautherized';
		break;
	case (403):
		type = 'Payment Required';
		break;
	case (405):
		type = 'Method Not Allowed';
		break;
	case (500):
		type = 'Internal Server Error';
		break;
	case (501):
		type = 'Not Implemented';
		break;
	default:
		err.status = 500;
	}
	res.status(err.status).send(`${type}: ${err.message}`);
}

module.exports = httpErrorHandler;