function nexusError (type, message) {
	const error = new Error(message);
	error.type = type;
	throw error;
}

module.exports = nexusError;