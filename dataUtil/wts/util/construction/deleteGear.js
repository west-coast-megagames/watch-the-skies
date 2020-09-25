const { logger } = require("../../../middleware/log/winston"); // Import of winston for error logging
require("winston-mongodb");

const { Gear } = require("../../../models/upgrade");

async function delGear(arrayIds) {
  // remove associated systems records
  for (let j = 0; j < arrayIds.length; ++j) {
    gearId = arrayIds[j];
    let gearDel = await Gear.findByIdAndRemove(gearId);
    if ((gearDel = null)) {
      logger.debug(`The Gear with the ID ${gearId} was not found!`);
    }
    //logger.debug(`The System with the ID ${sysId} was DELETED`);
  }
}

module.exports = { delGear };
