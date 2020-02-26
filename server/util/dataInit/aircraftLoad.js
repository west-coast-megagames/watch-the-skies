const fs = require('fs')
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initAircraft.json', 'utf8');
const aircraftDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const aircrafLoadDebugger = require('debug')('app:aircraftLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Aircraft Model - Using Mongoose Model
const { Aircraft, validateAircraft, updateStats } = require('../../models/ops/aircraft');
const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team/team');
const { System } = require('../../models/gov/equipment/systems');
const { loadSystems, systems } = require('../../wts/construction/systems/systems');
const { BaseSite } = require('../../models/sites/baseSite');
const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runaircraftLoad(runFlag){
  try {  
    //logger.debug("Jeff in runaircraftLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      await loadSystems();                         // load wts/json/systems.json data into array    
      
      await deleteAllAircrafts(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    logger.info(`Catch runaircraftLoad Error: ${err.message}`);
    return false; 
  }
};

async function initLoad(doLoad) {
  
  if (!doLoad) return;

  for (let i = 0; i < aircraftDataIn.length; ++i ) {
    
    //logger.debug(`Jeff in runaircraftLoad loop   ${i}  ${aircraftDataIn[i].name}`);    
    //logger.debug(`Jeff in runaircraftLoad loop ${i} ${aircraftDataIn[i]}` );
    
    await loadAircraft(aircraftDataIn[i]);
  }
};

async function loadAircraft(iData){
  try {   
    //logger.debug(`Jeff in loadAircraft  ${iData.name} ${iData.type}`); 
    let aircraft = await Aircraft.findOne( { name: iData.name } );
    if (!aircraft) {
       // New Aircraft here
       let aircraft = new Aircraft({ 
           name: iData.name,
           type: iData.type
        }); 

        aircraft.stats  = iData.stats;
        aircraft.status = iData.status;

        if (iData.team != ""){
          let team = await Team.findOne({ teamCode: iData.team });  
          if (!team) {
            logger.debug(`Aircraft Load Team Error, New Aircraft: ${iData.name}  Team:  ${iData.team}`);
          } else {
            aircraft.team = team._id;
            logger.debug(`Aircraft Load Team Found, Aircraft: ${iData.name} Team:  ${iData.team} Team ID: ${team._id}`);
          }
        }      

        // create systems records for aircraft and store ID in aircraft.system
        //console.log("jeff aircraft systems  iData.loadout", iData.loadout);
        aircraft.systems = [];
        for (let sys of iData.loadout) {
          let sysRef = systems[systems.findIndex(system => system.name === sys )];
          //console.log("jeff in aircraft systems ", sys, "sysRef:", sysRef);
          if (sysRef) {
            newSystem = await new System(sysRef);
            newSystem.team         = aircraft.team;
            newSystem.manufacturer = aircraft.team;  
            //console.log("jeff in aircraft before systems save ... sysRef:", sysRef);            
            await newSystem.save(((err, newSystem) => {
              if (err) {
                logger.error(`New Aircraft System Save Error: ${err}`);
                return console.error(`New Aircraft System Save Error: ${err}`);
              }
              logger.debug(`aircraft.name, system ${sys} add saved to system collection.`);
            }));

            aircraft.systems.push(newSystem._id)

          } else {
            logger.debug(`Error in creation of system ${sys} for  ${aircraft.name}`);
          }
        }

        if (iData.base != "" && iData.base != "undefined" ){
          let baseSite = await BaseSite.findOne({ siteCode: iData.base });  
          if (!baseSite) {
            logger.debug(`Aircraft Load Base Error, New Aircraft:  ${iData.name}  Base:  ${iData.base}`);
          } else {
            aircraft.baseOrig = baseSite._id;
            logger.debug(`Aircraft Load Base Found, Aircraft: ${iData.name}  Base:  ${iData.base} Base ID: ${baseSite._id}`);
          }
        }      

        if (iData.site != "" && iData.site != "undefined" ){
          let site = await Site.findOne({ siteCode: iData.site });  
          if (!site) {
            logger.debug(`Aircraft Load Site Error, New Aircraft:  ${iData.name}  Site:  ${iData.site}`);
          } else {
            aircraft.site = site._id;
            logger.debug(`Aircraft Load Site Found, Aircraft: ${iData.name}  Site:  ${iData.site} Site ID: ${site._id}`);
          }
        } else {
          aircraft.site = aircraft.baseOrig;
        }     

        if (iData.zone != ""){
          let zone = await Zone.findOne({ zoneCode: iData.zone });  
          if (!zone) {
            logger.debug(`Aircraft Load Zone Error, New Aircraft: ${iData.name}  Zone:  ${iData.zone}`);
          } else {
            aircraft.zone = zone._id;
            logger.debug(`Aircraft Load Zone Found, New Aircraft: ${iData.name}  Zone:  ${iData.zone} Zone ID: ${zone._id}`);
          }      
        }

        if (iData.country != ""){
          let country = await Country.findOne({ code: iData.country });  
          if (!country) {
            logger.debug(`Aircraft Load Country Error, New Aircraft: ${iData.name} Country:  ${iData.country}`);
          } else {
            aircraft.country = country._id;
            aircraft.zone    = country.zone;
            logger.debug(`Aircraft Load Country Found, New Aircraft: ${iData.name}  Country:  ${iData.country} Country ID: ${country._id}`);
          }      
        }

        let { error } = validateAircraft(aircraft); 
        if (error) {
          logger.error(`New Aircraft Validate Error ${aircraft.name} ${error.message}`);
          // remove associated systems records
          for (let j = 0; j < aircraft.systems.length; ++j ) {
            sysId = aircraft.systems[j];
            let systemDel = await System.findByIdAndRemove(sysId);
            if (systemDel = null) {
              logger.debug(`The Aircraft System with the ID ${sysId} was not found!`);
            }
            logger.debug(`The Aircraft System with the ID ${sysId} was DELETED ... Aircraft validate error!`);
          }      
          return; 
        }

        //console.log("jeff before save", aircraft.name,  " systems ", aircraft.systems);

        await aircraft.save((err, aircraft) => {
          if (err) return console.error(`New Aircraft Save Error: ${err}`);
          logger.debug(aircraft.name + " add saved to aircraft collection.");
          updateStats(aircraft._id);
        });

        //console.log("jeff after save", aircraft.name,  " systems ", aircraft.systems, "saveSys:", saveSys);

    } else {       
      // Existing Aircraft here ... update
      let id = aircraft._id;
      
      aircraft.name        = iData.name;
      aircraft.type        = iData.type;
      aircraft.status      = iData.status;
      aircraft.stats       = iData.stats;

      if (iData.team != ""){
        let team = await Team.findOne({ teamCode: iData.team });  
        if (!team) {
          logger.debug("Aircraft Load Team Error, Update Aircraft:", iData.name, " Team: ", iData.team);
        } else {
          aircraft.team = team._id;
          logger.debug("Aircraft Load Update Team Found, Aircraft:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
        }
      }  

      // create systems records for aircraft and store ID in aircraft.system
      if (iData.loadout.length != 0){
        // create systems records for aircraft and store ID in aircraft.system
        aircraft.systems = [];
        for (let sys of iData.loadout) {
          let sysRef = systems[systems.findIndex(system => system.name === sys )];
          newSystem = await new System(sysRef);
          newSystem.team   = aircraft.team;
          newSystem.manufacturer = aircraft.team;
          await newSystem.save(((err, newSystem) => {
          if (err) return console.error(`New Aircraft System Save Error: ${err}`);
          //logger.debug(aircraft.name, "system", sys, " add saved to system collection.");
          }));

          aircraft.systems.push(newSystem._id)
        }
      }

      if (iData.base != "" && iData.base != "undefined" ){
        let baseSite = await BaseSite.findOne({ siteCode: iData.base });  
        if (!baseSite) {
          logger.debug("Aircraft Load Base Error, Update Aircraft:", iData.name, " Base: ", iData.base);
        } else {
          aircraft.baseOrig = baseSite._id;
          logger.debug("Aircraft Load Update Base Found, Aircraft:", iData.name, " Base: ", iData.base, "Base ID:", baseSite._id);
        }
      }      

      if (iData.site != "" && iData.site != "undefined" ){
        let site = await Site.findOne({ siteCode: iData.site });  
        if (!site) {
          logger.debug("Aircraft Load Site Error, Update Aircraft:", iData.name, " Site: ", iData.site);
        } else {
          aircraft.site = site._id;
          logger.debug("Aircraft Load Update Site Found, Aircraft:", iData.name, " Site: ", iData.base, "Site ID:", site._id);
        }
      }      

      if (iData.zone != ""){
        let zone = await Zone.findOne({ zoneCode: iData.zone });  
        if (!zone) {
          logger.debug("Aircraft Load Zone Error, Update Aircraft:", iData.name, " Zone: ", iData.zone);
        } else {
          aircraft.zone = zone._id;
          logger.debug("Aircraft Load Zone Found, Update Aircraft:", iData.name, " Zone: ", iData.zone, "Zone ID:", zone._id);
        }      
      }

      if (iData.country != ""){
        let country = await Country.findOne({ code: iData.country });  
        if (!country) {
          logger.debug("Aircraft Load Country Error, Update Aircraft:", iData.name, " Country: ", iData.country);
        } else {
          aircraft.country = country._id;
          aircraft.zone    = country.zone;
          logger.debug("Aircraft Load Country Found, Update Aircraft:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
        }      
      }

      const { error } = validateAircraft(aircraft); 
      if (error) {
        logger.debug("Aircraft Update Validate Error", iData.name, error.message);
        return
      }
   
      await aircraft.save((err, aircraft) => {
        if (err) return console.error(`Aircraft Update Save Error: ${err}`);
        logger.debug(aircraft.name + " update saved to aircraft collection.");
        updateStats(aircraft._id);
      });
    }
  } catch (err) {
    logger.debug('Catch Aircraft Error:', err.message);
    return;
}

};

async function deleteAllAircrafts(doLoad) {
  
  logger.debug("Jeff in deleteAllAircrafts", doLoad);    
  if (!doLoad) return;

  try {
    for await (const aircraft of Aircraft.find()) {    
      let id = aircraft._id;

      //logger.debug("Jeff in deleteAllAircrafts loop", aircraft.name); 
      try {

        // remove associated systems records
        for (let j = 0; j < aircraft.systems.length; ++j ) {
          sysId = aircraft.systems[j];
          let systemDel = await System.findByIdAndRemove(sysId);
          if (systemDel = null) {
            logger.debug(`The Aircraft System with the ID ${sysId} was not found!`);
          }
        }

        let aircraftDel = await Aircraft.findByIdAndRemove(id);
        if (aircraftDel = null) {
          logger.debug(`The Aircraft with the ID ${id} was not found!`);
        }
        //logger.debug("Jeff in deleteAllAircrafts loop after remove", aircraft.name); 
      } catch (err) {
        logger.debug('Aircraft Delete All Error:', err.message);
      }
    }        
    logger.debug("All Aircrafts succesfully deleted!");
  } catch (err) {
    logger.debug(`Delete All Aircrafts Catch Error: ${err.message}`);
  }
};  

module.exports = runaircraftLoad;