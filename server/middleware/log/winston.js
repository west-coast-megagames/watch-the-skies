const errorDebugger = require("debug")("app:error");
const winston = require("winston");
// may need to comment out line below if we have problems with integration testing
require("winston-mongodb");
const dbURI = require("../../config/keys").mongoURI;

const { createLogger, format, transports } = winston;

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "Default Log:" },
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    // Errors only File
    new transports.File({ filename: "prototype-error.log", level: "error" }),
    // Info / Warnings / Errors combined
    new transports.File({ filename: "prototype-combined.log", level: "info" }),
    // Debug / Verbose/ Http / Info / Warnings / Errors combined
    new transports.File({
      filename: "prototype-debug-combined.log",
      level: "debug",
    }),
    // Error DB to log collection
    new transports.MongoDB({
      db: dbURI,
      level: "error",
      metaKey: "meta",
      collection: "logerrors",
      options: { useUnifiedTopology: true },
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
} else {
  // use regular debug in non-production mode
  // debug.log = (...args) => logger.debug(util.format(...args))
}

function routeError(err, req, res, next) {
  logger.error(`${err.message}`, { meta: err.stack });

  errorDebugger("Error:", err.message);
  res.status(500).send(`Error: ${err.message}`);
}

module.exports = { routeError, logger };
