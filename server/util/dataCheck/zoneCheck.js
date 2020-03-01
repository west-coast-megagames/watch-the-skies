// Zone Model - Using Mongoose Model
const { Zone, validateZone } = require('../../models/zone');
const { Country } = require('../../models/country'); 
const { Site } = require('../../models/sites/site');

const zoneCheckDebugger = require('debug')('app:zoneCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkZone(runFlag) {
  // get countries once
  let cFinds = await Country.find();    
  for (const zone of await Zone.find()
                               .populate("satellite", "name")) { 
                                
    // should be at least one country in the zone
    let countryCount = 0;
    let zoneId = zone._id.toHexString();
    countryLoop:
    for (let j = 0; j < cFinds.length; ++j){
      let cZoneId = cFinds[j].zone.toHexString();
      if (cZoneId === zoneId) {
        ++countryCount;
      }
      //only need one
      if (countryCount > 0) {
        break countryLoop;
      }
    }

    //zoneCheckDebugger(`Zone ${zone.zoneCode} has ${countryCount} countries`);
    if (countryCount < 1){
      logger.error(`No Countries Found In Zone ${zone.zoneCode} ${zone.zoneName}`);
    }

    //zoneCheckDebugger(`Zone ${zone.zoneName} ${zone._id} Check of Satellite ${zone.satellite.length}`);
    for (let i = 0; i < zone.satellite.length; ++i){
      //zoneCheckDebugger(`Zone ${zone.zoneName} ${zone._id} about to find satellite for ID ${i}: ${zone.satellite[i]}`);
      let sFind = await Site.findById(zone.satellite[i]);
      if (!sFind) {
        logger.error(`Zone ${zone.zoneName} ${zone._id} has an invalid satellite reference ${i}: ${zone.satellite[i]}`);
      } else {
        if (!(sFind.type === "Spacecraft")) {
          logger.error(`Zone ${zone.zoneName} ${zone._id} has non-Spacecraft satellite reference ${i}: ${zone.satellite[i]} ${sFind.type}`);
        } else if (!(sFind.shipType === "Satellite")) {
          logger.error(`Zone ${zone.zoneName} ${zone._id} has non-satellite reference ${i}: ${zone.satellite[i]} ${sFind.shipType}`);
        }
        //zoneCheckDebugger(`Zone ${zone.zoneName} ${zone._id} Found satellite for ID ${i}: ${zone.satellite[i]} ${sFind.name}`);
      }
    }

    let { error } = await validateZone(zone); 
    if (error) {
      logger.error(`Zone Validation Error For ${zone.zoneCode} ${zone.zoneName} Error: ${error.details[0].message}`);
    }
  }
  return true;
};

module.exports = chkZone;