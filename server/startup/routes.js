const bodyParser = require('body-parser');

// Error handling and Logging
const error = require('../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling
const cors = require('cors');

// Routes - Using Express
const article = require('../routes/api/articles');
const auth = require('../routes/api/auth');
const account = require('../routes/api/accounts');
const banking = require('../routes/api/banking');
const control = require('../routes/api/control');
const country = require('../routes/api/country');
const facilities = require('../routes/api/facilities');
const home = require('../routes/api/home');
const interceptor = require('../routes/api/interceptor');
const intercept = require('../routes/api/intercept');
const logs = require('../routes/api/log');
const logError = require('../routes/api/logErrors');
const logInfo = require('../routes/api/logInfo');
const military = require('../routes/api/military');
const news = require('../routes/api/news');
const research = require('../routes/api/research');
const sites = require('../routes/api/sites');
const team = require('../routes/api/team');
const tableau = require('../routes/api/tableau');
const trade = require('../routes/api/trade')
const treaty = require('../routes/api/treaty')
const zones = require('../routes/api/zones');

const debug = require('../routes/debugRoute');
const game = require('../routes/game/game');
const admin = require('../routes/game/admin');
const del = require('../routes/game/delete');

const users = require('../routes/users');

//const initData = require('../routes/api/initData');


module.exports = function(app) {
    // Bodyparser Middleware
    app.use(bodyParser.json());

    // Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
    app.use(cors());

    // Express Routes - Endpoints to connect to through the browser. (Housed routes folder)
    app.use('/', home);
    app.use('/debug', debug); // Route for debug triggering
    app.use('/game', game);
    app.use('/game/admin', admin);
    app.use('/game/delete', del);
    app.use('/api/auth', auth);
    app.use('/api/interceptor', interceptor); // Route for manipulating interceptors
    app.use('/api/team', team); // Route for Teams
    app.use('/api/intercept', intercept); // Route for triggering an interception
    app.use('/api/zones', zones); // Route for inputing zones
    app.use('/api/country', country); // Route for inputing countries
    app.use('/api/facilities', facilities); // Route for inputing countries
    app.use('/api/sites', sites) // Route for sites
    app.use('/api/accounts', account); // Route for inputing accounts
    app.use('/user', users); // Route for dealing with Users
    app.use('/api/news', news); // Route for the news desks
    app.use('/api/logs', logs); // Route for logs
    app.use('/api/banking', banking); // Route for banking functions
    app.use('/api/research', research); // Route for research functions
    app.use('/api/military', military); // Route for manipulating militarys
    app.use('/api/articles', article); // Route for manipulating articles
    app.use('/api/logErrors', logError); // Route for manipulating logError
    app.use('/api/logInfo', logInfo); // Route for manipulating logInfo
    app.use('/tableau', tableau); // Route for tableau API
    app.use('/api/trade', trade); //
    app.use('/api/treaty', treaty); //treaties
    //app.use('/api/initData', initData); // Route for Init Data functions

    app.use('/api/control', control)

    app.use(error.routeError);
}