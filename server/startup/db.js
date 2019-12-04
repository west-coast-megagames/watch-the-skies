const mongoose = require('mongoose');
const { logger } = require('../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling

// DB Config | Saved in the config folder | Mogoose Key
const dbURI = require('../config/keys').mongoURI;
const mongoOptions =  {
    useNewUrlParser: true,
    dbName: 'test'
};

module.exports = function () {
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    
    // Connect to MongoDB with Mongoose
    mongoose.connect(dbURI, mongoOptions)
    .then(() => logger.info('MongoDB Connected...'))
}