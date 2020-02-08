const errorDebugger = require('debug')('app:error')
const winston = require('winston');
// may need to comment out line below if we have problems with integration testing
require ('winston-mongodb');
const dbURI = require('../config/keys').mongoURI;

const { createLogger, format, transports } = winston;

const logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    defaultMeta: { service: 'Default Log:' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `quick-start-combined.log`.
      // - Write all logs error (and below) to `quick-start-error.log`.
      //
      new transports.File({ filename: 'prototype-error.log', level: 'error' }),
      new transports.File({ filename: 'prototype-combined.log' }),
      new transports.MongoDB({ db: dbURI,
                               level: 'error'})
    ]
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
      format: format.combine(
      format.colorize(),
      format.simple()
    )
    }));
  }

  function routeError (err, req, res, next) {
    logger.error(err);

    errorDebugger('Error:', err.message);
    res.status(500).send(`Error: ${err.message}`);
};

module.exports = { routeError, logger }