const { logger } = require('../../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const { Facility, Lab, Hanger, Factory, Crisis, Civilian } = require('../../../models/facility');

async function delFacilities(arrayIds) {
  // remove associated facility records
  for (let j = 0; j < arrayIds.length; ++j ) {
    facId = arrayIds[j];
    let facDel = await Facility.findByIdAndRemove(facId);
    if (facDel = null) {
      logger.debug(`The Facility with the ID ${facId} was not found!`);
    }
  }
}
  
module.exports = { delFacilities };