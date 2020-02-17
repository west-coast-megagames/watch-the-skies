const mongoose = require('mongoose');


// DB Config | Saved in the config folder | Mogoose Key
const dbURI = 'mongodb+srv://Admin:u8A7WZzz80uLT5we@cluster0-dvbtk.azure.mongodb.net/test?retryWrites=true&w=majority'
const mongoOptions =  {
    useNewUrlParser: true,
    dbName: 'test',
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
};

module.exports = function () {
    // Connect to MongoDB with Mongoose
    mongoose.set('useUnifiedTopology', true);
    mongoose.connect(dbURI, mongoOptions)
    .then(() => console.log(`MongoDB Connected to test...`));
}