function nexusError (message, status) {
	const error = new Error(message);
	error.status = status;
	throw error;
}

module.exports = nexusError;