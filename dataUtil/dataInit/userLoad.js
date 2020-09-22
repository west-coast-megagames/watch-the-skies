const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initUser.json",
  "utf8"
);
const userDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const userLoadDebugger = require("debug")("app:userLoad");

const supportsColor = require("supports-color");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// User Model - Using Mongoose Model
const {
  User,
  validateUser,
  validateName,
  validateAddr,
} = require("../models/user");
const { Team, validateTeam } = require("../models/team");

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runUserLoad(runFlag) {
  try {
    //userLoadDebugger("Jeff in runUserLoad", runFlag);
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllUsers(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    userLoadDebugger("Catch runUserLoad Error:", err.message);
    logger.error(`Catch runUserLoad Error: ${err.message}`, { meta: err });
    return false;
  }
}

async function initLoad(doLoad) {
  //userLoadDebugger("Jeff in initLoad", doLoad, userDataIn.length);
  if (!doLoad) return;

  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };
  for (let data of userDataIn) {
    ++recReadCount;
    await loadUser(data, recCounts);
  }
  logger.info(
    `User Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );
}

async function loadUser(iData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";
  let loadCode = "";

  try {
    const salt = await bcrypt.genSalt(10);

    //userLoadDebugger("UserLoad ... Username", iData.username, "name", iData.name, "address", iData.address);
    let user = await User.findOne({ username: iData.username });
    loadName = iData.name;
    loadCode = iData.username;

    if (!user) {
      // New User here
      let convDate = new Date(iData.dob);
      let user = new User({
        username: iData.username,
        email: iData.email,
        phone: iData.phone,
        gender: iData.gender,
        discord: iData.discord,
        address: iData.address,
        dob: convDate,
      });

      user.password = await bcrypt.hash(iData.password, salt);

      user.name.first = iData.name.first;
      user.name.last = iData.name.last;
      user.roles = iData.roles;
      user.gameState = [];
      user.serviceRecord = [];

      //userLoadDebugger("Before Save Validate ... New user.name", user.name.first, "address street1", user.address.street1, user.dob);

      const test1 = validateUser(user);
      if (test1.error) {
        loadError = true;
        loadErrorMsg = `New User Validate Error ${iData.username} ${test1.error.details[0].message}`;
        userLoadDebugger(`${loadErrorMsg}`);
        //return;
      }

      //userLoadDebugger("Before Save Validate Name ... New user.name", user.name.first, "address street1", user.address.street1, user.dob);
      try {
        const test2 = validateName(user);
        if (test2.error) {
          loadError = true;
          loadErrorMsg = `New User Name Validate Error ${iData.username} ${test2.error.details[0].message}`;
          userLoadDebugger(`${loadErrorMsg}`);
          //return;
        }
      } catch (err) {
        loadError = true;
        loadErrorMsg = `New User Name Validate Error: ${iData.username} ${err}`;
        logger.error(`${loadErrorMsg}`);
        //return;
      }

      //userLoadDebugger("Before Save Validate Addr ... New user.name", user.name.first, "address street1", user.address.street1, user.dob);

      try {
        const test3 = validateAddr(user);
        if (test3.error) {
          loadError = true;
          loadErrorMsg = `New User Addr Validate Error ${iData.username} ${test3.error.details[0].message}`;
          userLoadDebugger(`${loadErrorMsg}`);
          //return;
        }
      } catch (err) {
        loadError = true;
        loadErrorMsg = `New User Addr Validate Error: ${iData.username} ${err}`;
        logger.error(`${loadErrorMsg}`);
        //return;
      }

      //userLoadDebugger("After Save Validate ... New user.name", user.name.first, "address street1", user.address.street1, user.dob);

      if (iData.teamCode != "") {
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          loadError = true;
          loadErrorMsg = `User Load Team Error, New User: ${iData.username} Team: ${iData.username} `;
          userLoadDebugger(`${loadErrorMsg}`);
        } else {
          user.team = team._id;
        }
      }

      //userLoadDebugger("Before Save ... New user.name", user.name.first, "address street1", user.address.street1, user.dob);
      if (!loadError) {
        try {
          let userSave = await user.save();
          ++rCounts.loadCount;
          userLoadDebugger(userSave.username + " saved to user collection.");
          return;
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`New User Save Error: ${err}`, { meta: err });
          return;
        }
      } else {
        logger.error(`User skipped due to errors: ${loadName} ${loadErrorMsg}`);
        ++rCounts.loadErrCount;
        return;
      }
    } else {
      // Existing User here ... update
      let id = user._id;
      let convDate = new Date(iData.dob);
      user.username = iData.username;
      user.name.first = iData.name.first;
      user.name.last = iData.name.last;
      user.phone = iData.phone;
      user.email = iData.email;
      user.address = iData.address;
      user.gender = iData.gender;
      user.discord = iData.discord;
      user.dob = convDate;
      user.roles = iData.roles;

      user.password = await bcrypt.hash(iData.password, salt);

      if (iData.teamCode != "") {
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          loadError = true;
          loadErrorMsg = `User Load Team Error, Update User: ${iData.username} Team: ${iData.teamCode}`;
          userLoadDebugger(`${loadErrorMsg}`);
        } else {
          user.team = team._id;
        }
      }

      const test1 = validateUser(user);
      if (test1.error) {
        loadError = true;
        loadErrorMsg = `User Update Validate Error ${iData.username} ${test1.error.details[0].message}`;
        userLoadDebugger(`${loadErrorMsg}`);
        //return;
      }

      try {
        const test2 = validateName(user.name);
        if (test2.error) {
          loadError = true;
          loadErrorMsg = `User Update Name Validate Error ${iData.username} ${test2.error.details[0].message}`;
          userLoadDebugger(`${loadErrorMsg}`);
          //return;
        }
      } catch (err) {
        loadError = true;
        loadErrorMsg = `User Update Name Validate Error ${iData.username} ${err.message}`;
        userLoadDebugger(`${loadErrorMsg}`);
        //return;
      }

      try {
        const test3 = validateAddr(user.address);
        if (test3.error) {
          loadError = true;
          loadErrorMsg = `User Update Addr Validate Error ${iData.username} ${test3.error.details[0].message}`;
          userLoadDebugger(`${loadErrorMsg}`);
          //return;
        }
      } catch (err) {
        loadError = true;
        loadErrorMsg = `User Update Addr Validate Error ${iData.username} ${err.message}`;
        userLoadDebugger(`${loadErrorMsg}`);
        //return;
      }

      if (!loadError) {
        try {
          let userSave = await user.save();
          ++rCounts.updCount;
          userLoadDebugger(
            userSave.username + " update saved to user collection."
          );
          return;
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`User Update Save Error: ${err}`, { meta: err });
          return;
        }
      }
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch User Error: ${err.message}`, { meta: err });
    userLoadDebugger("Catch User Error:", err.message);
    return;
  }
}

async function deleteAllUsers(doLoad) {
  userLoadDebugger("Jeff in deleteAllUsers", doLoad);
  if (!doLoad) return;

  try {
    for await (const user of User.find()) {
      let id = user._id;
      try {
        let userDel = await User.findByIdAndRemove(id);
        if ((userDel = null)) {
          userLoadDebugger(`The Zone with the ID ${id} was not found!`);
        }
      } catch (err) {
        userLoadDebugger("User Delete All Error:", err.message);
      }
    }
    userLoadDebugger("All Users succesfully deleted!");
  } catch (err) {
    userLoadDebugger(`Delete All Users Catch Error: ${err.message}`);
  }
}

module.exports = runUserLoad;
