// Zone Model - Using Mongoose Model
const { Zone, validateZone } = require('../../models/zone');
const { Country } = require('../../models/country'); 

const zoneLoadDebugger = require('debug')('app:zoneLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkZone(runFlag) {
  // get countries once
  let cFinds = await Country.find();    
  for (const zone of await Zone.find()) { 
    // should be at least one country in the zone
    let countryCount = 0;
    let zoneId = zone._id.toHexString();
    for (let j = 0; j < cFinds.length; ++j){
      let cZoneId = cFinds[j].zone.toHexString();
      if (cZoneId === zoneId) {
        ++countryCount;
      }
    }

    //zoneLoadDebugger(`Zone ${zone.zoneCode} has ${countryCount} countries`);
    if (countryCount < 1){
      logger.info(`No Countries Found In Zone ${zone.zoneCode} ${zone.zoneName}`);
    }

    let { error } = await validateZone(zone); 
    if (error) {
      logger.error(`Zone Validation Error For ${zone.zoneCode} ${zone.zoneName} Error: ${error.details[0].message}`);
    }
  }
  return true;
};

module.exports = chkZone;