const { logger } = require("../../../middleware/log/winston"); // Import of winston for error logging
require("winston-mongodb");

const { System } = require("../../../models/upgrade");

async function delSystems(arrayIds) {
  // remove associated systems records
  for (let j = 0; j < arrayIds.length; ++j) {
    sysId = arrayIds[j];
    let systemDel = await System.findByIdAndRemove(sysId);
    if ((systemDel = null)) {
      logger.debug(`The System with the ID ${sysId} was not found!`);
    }
    //logger.debug(`The System with the ID ${sysId} was DELETED`);
  }
}

module.exports = { delSystems };
