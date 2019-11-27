const errorDebugger = require('debug')('app:error')
const winston = require('winston');

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
    defaultMeta: { service: 'your-service-name' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `quick-start-combined.log`.
      // - Write all logs error (and below) to `quick-start-error.log`.
      //
      new transports.File({ filename: 'prototype-error.log', level: 'error' }),
      new transports.File({ filename: 'prototype-combined.log' })
    ]
  });

  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));

module.exports = (err, req, res, next) => {
    logger.info(err.message, err);

    errorDebugger('Error:', err.message);
    res.status(500).send(`Error: ${err.message}`);
};