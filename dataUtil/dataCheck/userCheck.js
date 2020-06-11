// User Model - Using Mongoose Model
const {
  User,
  validateUser,
  validateName,
  validateAddr,
} = require("../models/user");
const { Team } = require("../models/team/team");

const userCheckDebugger = require("debug")("app:userCheck");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const roleTypeVals = ["Player", "Control", "Admin"];
const genderTypeVals = ["Male", "Female", "Non-Binary"];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkUser(runFlag) {
  for (const user of await User.find()
    //.populate("team", "name"))   does not work with .lean
    .lean()) {
    //if (!user.populated("team")) {
    //  logger.error(`Team link missing for User ${user.username} ${user._id}`);
    // }
    if (!user.hasOwnProperty("team")) {
      logger.error(`team missing for User ${user.username} ${user._id}`);
    } else {
      let team = await Team.findById({ _id: user.team });
      if (!team) {
        logger.error(
          `team reference is invalid for User ${user.username} ${user._id}`
        );
      }
    }

    if (!user.hasOwnProperty("model")) {
      logger.error(`model missing for User ${user.username} ${user._id}`);
    }

    if (!user.hasOwnProperty("username")) {
      logger.error(`username missing for User ${user.name} ${user._id}`);
    }

    if (!user.hasOwnProperty("name")) {
      logger.error(`name missing for User ${user.username} ${user._id}`);
    } else {
      if (!user.name.hasOwnProperty("first")) {
        logger.error(
          `first name missing for User ${user.username} ${user._id}`
        );
      }
      if (!user.name.hasOwnProperty("last")) {
        logger.error(`last name missing for User ${user.username} ${user._id}`);
      }
    }

    if (!user.hasOwnProperty("email")) {
      logger.error(`email missing for User ${user.username} ${user._id}`);
    }

    if (!user.hasOwnProperty("password")) {
      logger.error(`password missing for User ${user.username} ${user._id}`);
    }

    if (!user.hasOwnProperty("address")) {
      logger.error(`address missing for User ${user.username} ${user._id}`);
    } else {
      if (!user.address.hasOwnProperty("street1")) {
        logger.error(
          `street1 address missing for User ${user.username} ${user._id}`
        );
      }
      if (!user.address.hasOwnProperty("street2")) {
        logger.error(
          `street2 address missing for User ${user.username} ${user._id}`
        );
      }
      if (!user.address.hasOwnProperty("city")) {
        logger.error(
          `city address missing for User ${user.username} ${user._id}`
        );
      }
      if (!user.address.hasOwnProperty("state")) {
        logger.error(
          `state address missing for User ${user.username} ${user._id}`
        );
      }
      if (!user.address.hasOwnProperty("zipcode")) {
        logger.error(
          `zipcode address missing for User ${user.username} ${user._id}`
        );
      }
    }

    if (!user.hasOwnProperty("dob")) {
      logger.error(`dob missing for User ${user.username} ${user._id}`);
    }

    if (!user.hasOwnProperty("gender")) {
      logger.error(`gender missing for User ${user.username} ${user._id}`);
    } else {
      if (!inArray(genderTypeVals, user.gender)) {
        logger.error(
          `Invalid gender type ${user.gender} for User ${user.username} ${user._id}`
        );
      }
    }

    if (!user.hasOwnProperty("discord")) {
      logger.error(`discord missing for User ${user.username} ${user._id}`);
    }

    //has at least on role
    if (user.roles.length < 1) {
      logger.error(`No Roles Assigned to ${user.username} ${user._id}`);
    } else {
      for (let i = 0; i < user.roles.length; ++i) {
        if (!inArray(roleTypeVals, user.roles[i])) {
          logger.error(
            `Invalid role type ${user.roles[i]} for User ${user.username} ${user._id}`
          );
        }
      }
    }

    try {
      let test1 = validateUser(user);
      if (test1.error) {
        logger.error(
          `User Validation Error For ${user.username} Error: ${test1.error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `Validate Error for User (catch) ${user.username} ${user._id} Error: ${err.message}`
      );
    }

    try {
      let test2 = await validateName(user.name);
      if (test2.error) {
        logger.error(
          `User Name Validation Error For ${user.username} Error: ${test2.error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `User Name Validation Error (catch) For ${user.username} Error: ${err.message}`
      );
    }

    try {
      let test3 = await validateAddr(user.address);
      if (test3.error) {
        logger.error(
          `User Address Validation Error For ${user.username} Error: ${test3.error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `User Address Validation Error (catch) For ${user.username} Error: ${err.message}`
      );
    }
  }
  return true;
}

module.exports = chkUser;
