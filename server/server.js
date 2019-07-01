const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const items = require('./routes/api/items')
const wtsInterceptor = require('./routes/api/interceptor')

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
app.use('/api/wts/interceptor', wtsInterceptor);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`WTS Server started on port ${port}...`));