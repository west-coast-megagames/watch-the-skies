const { logger } = require('../log/winston');

function httpErrorHandler (res, err) {
	logger.error(err.message, { meta: err.stack });
	const error = {
		type: 'Server Error',
		message: err.message,
		meta: err.stack
	};

	switch (err.status) {
	case (400):
		error.type = 'Bad Request';
		break;
	case (401):
		error.type = 'Unautherized';
		break;
	case (403):
		error.type = 'Payment Required';
		break;
	case (405):
		error.type = 'Method Not Allowed';
		break;
	case (500):
		error.type = 'Internal Server Error';
		break;
	case (501):
		error.type = 'Not Implemented';
		break;
	default:
		error.status = 500;
	}
	res.status(err.status).json(error);
}

module.exports = httpErrorHandler;