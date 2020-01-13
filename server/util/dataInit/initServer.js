const express = require('express');
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const supportsColor = require('supports-color');
//const connect = require('../config/sockets');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const initLoadAll = require('./initLoadAll');

// Routes - Using Express
const interceptor = require('../../routes/api/interceptor');
const team = require('../../routes/api/team');
const intercept = require('../../routes/api/intercept');
const zones = require('../../routes/api/zones');
const country = require('../../routes/api/country');
const users = require('../../routes/users');
const news = require('../../routes/api/news');
const logs = require('../../routes/api/log');
const account = require('../../routes/api/accounts');
const config = require('config');

// Middleware - express and socketIo
const app = express();
const server = http.createServer(app);

// Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
app.use(cors());

// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config | Saved in the config folder | Mogoose Key
const dbURI = require('../../config/keys').mongoURI;
const mongoOptions =  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    dbName: config.get('dbName')};

// Connect to MongoDB with Mongoose
mongoose.connect(dbURI, mongoOptions)
    .then(() => dbDebugger(`MongoDB Connected ${config.get('dbName')} ...`))
    .catch(err => console.warn(err));

// Express Routes - Endpoints to connect to through the browser. (Housed routes folder)
app.use('../../api/interceptor', interceptor); // Route for manipulating interceptors
app.use('../../api/team', team); // Route for Teams
app.use('../../api/intercept', intercept); // Route for triggering an interception
app.use('../../api/zones', zones); // Route for inputing zones
app.use('../../api/country', country); // Route for inputing countries
app.use('../../users', users); // Route for dealing with Users
app.use('../../api/news', news); // Route for the news desks
app.use('../../api/logs', logs); // Route for logs
app.use('../../api/accounts', account); // Route for Team Accounts

let loadSel = config.get('loadSel');
if (loadSel == "") { 
  loadSel = "All"; 
}

initLoadAll(loadSel);

// Server entry point - Node Server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`WTS INIT Server started on port ${port}...`));
