const express = require("express");
const mongoose = require("mongoose");
const dbDebugger = require("debug")("app:db");
const { logger } = require("./middleware/winston"); // Import of winston for error logging
const supportsColor = require("supports-color");
//const connect = require('../config/sockets');
const http = require("http");
const bodyParser = require("body-parser");
const initLoadAll = require("./dataInit/initLoadAll");
const initCheckAll = require("./dataCheck/initCheckAll");
const config = require("config");

// Middleware - express and socketIo
const app = express();
const server = http.createServer(app);
require("./startup/logging")(); // Bootup for error handling

// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config | Saved in the config folder | Mogoose Key
const dbURI = require("./config/keys").mongoURI;
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
  dbName: config.get("dbName"),
};

// Connect to MongoDB with Mongoose
mongoose
  .connect(dbURI, mongoOptions)
  .then(() => dbDebugger(`MongoDB Connected ${config.get("dbName")} ...`))
  .then(() => logger.info(`MongoDB Connected ${config.get("dbName")} ...`));
/* let winston handle it
    .catch(err => console.warn(err));
    */

let loadSel = config.get("loadSel");
if (loadSel == "") {
  loadSel = "All";
}

// Express Routes - Endpoints to connect to through the browser.
app.get("/init", async (req, res) => {
  await initLoadAll(loadSel);
  res.status(200).send("Init Load All Done");
});

app.get("/chk", async (req, res) => {
  await initCheckAll(loadSel);
  res.status(200).send("Init Check All Done");
});

// Server entry point - Node Server
const port = process.env.PORT || 5000;
server.listen(port, () =>
  logger.info(`WTS INIT Server started on port ${port}...`)
);
