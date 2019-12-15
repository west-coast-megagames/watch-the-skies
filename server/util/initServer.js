const express = require('express');
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const supportsColor = require('supports-color');
//const connect = require('../config/sockets');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const runLoad = require('../util/initRefLoad');
const runTeamLoad = require('../util/teamLoad');
const runInterceptorLoad = require('../util/interceptorLoad');
const runUserLoad = require('../util/userLoad');
const runBaseLoad = require('../util/baseLoad');
const runAccountLoad = require('../util/accountLoad');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Routes - Using Express
const interceptor = require('../routes/api/interceptor');
const team = require('../routes/api/team');
const intercept = require('../routes/api/intercept');
const zones = require('../routes/api/zones');
const country = require('../routes/api/country');
const users = require('../routes/users');
const news = require('../routes/api/news');
const logs = require('../routes/api/log');
const account = require('../routes/api/accounts');

// Middleware - express and socketIo
const app = express();
const server = http.createServer(app);
//const io = require('socket.io')(server);

// Socket.io routes (Currently housed in config/sockets.js)
//connect(io);

// Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
app.use(cors());

// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config | Saved in the config folder | Mogoose Key
const dbURI = require('../config/keys').mongoURI;
const mongoOptions =  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'test'};

// Connect to MongoDB with Mongoose
mongoose.connect(dbURI, mongoOptions)
    .then(() => dbDebugger('MongoDB Connected...'))
    .catch(err => console.warn(err));

// Express Routes - Endpoints to connect to through the browser. (Housed routes folder)
app.use('/api/interceptor', interceptor); // Route for manipulating interceptors
app.use('/api/team', team); // Route for Teams
app.use('/api/intercept', intercept); // Route for triggering an interception
app.use('/api/zones', zones); // Route for inputing zones
app.use('/api/country', country); // Route for inputing countries
app.use('/users', users); // Route for dealing with Users
app.use('/api/news', news); // Route for the news desks
app.use('/api/logs', logs); // Route for logs
app.use('/api/accounts', account); // Route for Team Accounts

async function fullInit(){
  let initDone = await runLoad(true);   // load simple reference tables/documents from refdata.json
  console.log("Ref Init Done:", initDone);
  
  let teamDone = await runTeamLoad(true);   // load expanded team fields beyond simple reference from initTeams.json
  console.log("Team Load Done:", teamDone);

  let interceptorDone = await runInterceptorLoad(true);  // load expanded interceptor fields
  console.log("Interceptor Load Done: ", interceptorDone);

  let userDone = await runUserLoad(true);  // load expanded User fields
  console.log("User Load Done: ", userDone );

  let baseDone = await runBaseLoad(true);  // load expanded Base fields
  console.log("Base Load Done: ", baseDone);

  let accountsDone = await runAccountLoad(true);   // load expanded team accounts fields beyond simple reference from initAccounts.json
  console.log("Accunts Load Done: ", accountsDone);
}

fullInit();

// Server entry point - Node Server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`WTS INIT Server started on port ${port}...`));
