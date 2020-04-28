
const zoneSatDebugger = require('debug')('app:zoneSat');
const { Zone } = require('../../../models/zone'); 
const { Country } = require('../../../models/country'); 
const { Team } = require('../../../models/team/team'); 
const { logger } = require('../../../middleware/winston');
require ('winston-mongodb');

async function addSatelliteToZone(satId, zoneId, teamId) {

  let useZoneId = zoneId;
  let team = await Team.findById( teamId );
  if (team) {
    //zoneSatDebugger(`About to find home country for team ${team.name}`);
    if (team.homeCountry) {
      //zoneSatDebugger(`About to find home country for ${team.name} ${team.homeCountry}`);
      let country = await Country.findById( {"_id": team.homeCountry} );
      if (country) {
        if (country.zone) {
          useZoneId = country.zone;
          //zoneSatDebugger(`Found home country ${country.name} zone ${country.zone} for ${team.name}`);
        }
      }
    }
  }  
  
  let zoneUpd = await Zone.findById( useZoneId );
  
  if (!zoneUpd) {
    //zoneSatDebugger(`Unable to add satellite with id ${satId} to zone with id ${useZoneId}`);
    logger.error(`Unable to add satellite with id ${satId} to zone with id ${useZoneId}`);
  } else {
    zoneUpd.satellite.push(satId);  
    await zoneUpd.save();
  }    
}

async function delSatelliteFromZone(satId, zoneId) {

  let useZoneId = zoneId;
    
  let zoneUpd = await Zone.findById( useZoneId );
    
  if (!zoneUpd) {
    //zoneSatDebugger(`Unable to delete satellite with id ${satId} from zone with id ${useZoneId}`);
    logger.error(`Unable to delete satellite with id ${satId} from zone with id ${useZoneId}`);
  } else {
    zoneUpd.satellite.pull(satId);  
    await zoneUpd.save();
  }    
}
  
module.exports = { addSatelliteToZone, delSatelliteFromZone };