const errorDebugger = require('debug')('app:error')

module.exports = (err, req, res, next) => {
    // Log the exceptions
    errorDebugger('Error:', err.message);
    res.status(500).send(`Error: ${err.message}`);
};