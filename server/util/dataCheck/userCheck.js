// User Model - Using Mongoose Model
const { User, validateUser, validateName, validateAddr } = require('../../models/user');

const userCheckDebugger = require('debug')('app:userCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkUser(runFlag) {
  
  for (const user of await User.find()
                               .populate("team", "name")) { 
    
    if (!user.populated("team")) {  
      logger.error(`Team link missing for User ${user.username} ${user._id}`);
    }
    
    //has at least on role
    if (user.roles.length < 1) {
      logger.error(`No Roles Assigned to ${user.username} ${user._id}`);
    } 

    let test1 = validateUser(user);
    if (test1.error) {
      logger.error(`User Validation Error For ${user.username} Error: ${test1.error.details[0].message}`);
    }
    
    try {
      let test2 = await validateName(user.name); 
      if (test2.error) {
        logger.error(`User Name Validation Error For ${user.username} Error: ${test2.error.details[0].message}`);
      }
    } catch (err) {
      logger.error(`User Name Validation Error For ${user.username} Error: ${ err.message }`);    
    }

    try {
      let test3 = await validateAddr(user.address); 
      if (test3.error) {
        logger.error(`User Address Validation Error For ${user.username} Error: ${test3.error.details[0].message}`);
      }
    } catch (err) {
      logger.error(`User Address Validation Error For ${user.username} Error: ${err.message}`);
    }
  }
  return true;
};

module.exports = chkUser;