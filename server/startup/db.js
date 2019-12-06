const mongoose = require('mongoose');
const { logger } = require('../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling

// DB Config | Saved in the config folder | Mogoose Key
const dbURI = require('../config/keys').mongoURI;
const mongoOptions =  {
    useNewUrlParser: true,
    dbName: 'test',
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
};

module.exports = function () {
    // Connect to MongoDB with Mongoose
    mongoose.connect(dbURI, mongoOptions)
    .then(() => logger.info('MongoDB Connected...'))
}