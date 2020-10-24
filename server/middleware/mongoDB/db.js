const mongoose = require('mongoose');
const { logger } = require('../log/winston'); // middleware/error.js which is running [npm] winston for error handling
const config = require('config');

// DB Config | Saved in the config folder | Mogoose Key
const dbURI = require('../../config/keys').mongoURI;
const mongoOptions = {
	dbName: config.get('dbName'),
	useFindAndModify: false,
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true
};

module.exports = function () {
	// Connect to MongoDB with Mongoose
	mongoose.connect(dbURI, mongoOptions)
		.then(() => logger.info(`MongoDB Connected to ${config.get('dbName')}...`));
};