const express = require('express');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Routes - Using Express
const interceptor = require('./routes/api/interceptor');
const intercept = require('./routes/api/intercept');
const country = require('./routes/api/country');

// Middleware - express and socketIo
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Socket.io connection for new sockets
io.on('connection', (client) => {
    console.log('New client connected...');
    client.on('subscribeToTimer', (interval) => {
        console.log(`Client has subscribed to timer with interval ${interval}`);
        setInterval(() => {
            client.emit('timer', new Date());
        }, interval);
    });
    client.on('disconnect', () => console.log('Client Disconnected...'));
});

// Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
app.use(cors());

// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config | Saved in the config folder | Mogoose Key
const dbURI = require('./config/keys').mongoURI;
const mongoOptions =  {
    useNewUrlParser: true,
    dbName: 'test'};

// Connect to MongoDB with Mongoose
mongoose.connect(dbURI, mongoOptions)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.warn(err));

// Express Routes - Inpoints to connect to through the browser.
app.use('/api/interceptor', interceptor); // Route for manipulating interceptors
app.use('/api/intercept', intercept); // Route for triggering an interception
app.use('/api/country', country); // Route for inputing countries

// Server entry point - Node Server
const port = process.env.PORT || 5000;
const ioPort = process.env.PORT || 4000;
app.listen(port, () => console.log(`WTS Server started on port ${port}...`));
server.listen(ioPort, () => console.log(`socket.io Server started on port ${ioPort}...`));