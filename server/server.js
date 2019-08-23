const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Routes
const items = require('./routes/api/items')
const interceptor = require('./routes/api/interceptor')
const intercept = require('./routes/api/intercept')

const app = express();

// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config | Saved in the config folder
const dbURI = require('./config/keys').mongoURI;
const mongoOptions =  {
    useNewUrlParser: true,
    dbName: 'test'};

// Connect to Mongo
mongoose.connect(dbURI, mongoOptions)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.warn(err));

// Use Routes
app.use('/api/items', items);
app.use('/api/interceptor', interceptor);
app.use('/api/intercept', intercept);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`WTS Server started on port ${port}...`));