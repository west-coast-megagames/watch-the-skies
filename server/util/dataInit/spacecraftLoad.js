const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initSpacecraft.json', 'utf8');
const spacecraftDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const spacecraftDebugger = require('debug')('app:spacecraftLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Spacecraft Model - Using Mongoose Model
const { Spacecraft, validateSpacecraft, updateStats } = require('../../models/sites/spacecraft');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team/team');
const { Facility } = require('../../models/gov/facility/facility');
const { Lab } = require('../../models/gov/facility/lab');
const { Hanger } = require('../../models/gov/facility/hanger');
const { Factory } = require('../../models/gov/facility/factory');
const { System } = require('../../models/gov/equipment/systems');
const { loadSystems, systems } = require('../../wts/construction/systems/systems');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runSpacecraftLoad(runFlag){
  try {  
    //spacecraftDebugger("Jeff in runSpacecraftLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      
      await loadSystems();                         // load wts/json/systems.json data into array 
      
      await deleteAllSpacecraft(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    spacecraftDebugger('Catch runSpacecraftLoad Error:', err.message);
    return; 
  }
};

async function initLoad(doLoad) {
  
  //spacecraftDebugger("Jeff in initLoad", doLoad, spacecraftDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < spacecraftDataIn.length; ++i ) {
    
    //spacecraftDebugger("Jeff in runSpacecraftLoad loop", i, spacecraftDataIn[i].name );    
    //spacecraftDebugger("Jeff in runSpacecraftLoad loop", i, spacecraftDataIn[i] );
    
    await loadSpacecraft(spacecraftDataIn[i]);
  }
};

async function loadSpacecraft(iData){
  try {   
    let spacecraft = await Spacecraft.findOne( { name: iData.name } );
    if (!spacecraft) {
      // New Spacecraft here
      let spacecraft = new Spacecraft({ 
        name: iData.name,
        siteCode: iData.code,
        geoDMS: { 
        latDMS: iData.latDMS,
        longDMS: iData.longDMS
        },
        geoDecimal: {
         latDecimal: iData.latDecimal,
         longDecimal: iData.longDecimal
        }
      }); 

      if (iData.parentCode2 != ""){
        let team = await Team.findOne({ teamCode: iData.parentCode2 });  
        if (!team) {
          spacecraftDebugger("Spacecraft Load Team Error, New Spacecraft:", iData.name, " Team: ", iData.parentCode2);
        } else {
          spacecraft.team  = team._id;
          spacecraftDebugger("Spacecraft Load Team Found, Spacecraft:", iData.name, " Team: ", iData.parentCode1, "Team ID:", team._id);
        }
      }      

      spacecraft.systems = [];
      for (let sys of iData.loadout) {
        let sysRef = systems[systems.findIndex(system => system.name === sys )];
        //console.log("jeff in spacecraft systems ", sys, "sysRef:", sysRef);
        if (sysRef) {
          newSystem = await new System(sysRef);
          newSystem.team         = spacecraft.team;
          newSystem.manufacturer = spacecraft.team;  
          //console.log("jeff in spacecraft before systems save ... sysRef:", sysRef);            
          await newSystem.save(((err, newSystem) => {
            if (err) {
              logger.error(`New Spacecraft System Save Error: ${err}`);
              return console.error(`New Spacecraft System Save Error: ${err}`);
            }
            logger.debug(`spacecraft.name, system ${sys} add saved to system collection.`);
          }));

          spacecraft.systems.push(newSystem._id)

        } else {
          logger.debug(`Error in creation of system ${sys} for  ${spacecraft.name}`);
        }
      }

      let { error } = validateSpacecraft(spacecraft); 
      if (error) {
        // remove associated facility records
        for (let j = 0; j < spacecraft.facilities.length; ++j ) {
          facilityId = spacecraft.facilities[j];
          let facilityDel = await Facility.findByIdAndRemove(facilityId);
          if (facilityDel = null) {
            spacecraftDebugger(`The Spacecraft Facility with the ID ${facilityId} was not found!`);
          }
        }
        spacecraftDebugger("New Spacecraft Validate Error", iData.name, error.message);
        return;
      }
      spacecraft.baseDefenses = iData.baseDefenses;
      spacecraft.shipType     = iData.shipType;
      spacecraft.status       = iData.status;
      spacecraft.stats        = iData.stats;

      
      if (iData.parentCode1 != ""){
        let country = await Country.findOne({ code: iData.parentCode1 });  
        if (!country) {
          spacecraftDebugger("Spacecraft Load Country Error, New Spacecraft:", iData.name, " Country: ", iData.parentCode1);
        } else {
          spacecraft.country = country._id;
          spacecraft.zone    = country.zone;
          spacecraftDebugger("Spacecraft Load Country Found, New Spacecraft:", iData.name, " Country: ", iData.parentCode1, "Country ID:", country._id);
        }      
      }

      // create facility records for spacecraft and store ID in spacecraft.facilities
      spacecraft.facilities = [];
      for (let i = 0; i < iData.facilities.length; ++i ) {
        let fac = iData.facilities[i];
        let facError = false;
        let facType  = fac.type;
        let facId    = null;
        //switch not working ... using if else
        if (facType == 'Factory') {
          newFacility = await new Factory(fac);
          facId = newFacility._id;
        } else if (facType == 'Lab') {
          newFacility = await new Lab(fac);
          facId = newFacility._id;
        } else if (facType == 'Hanger') {
          newFacility = await new Hanger(fac);
          facId = newFacility._id;
        } else {
          logger.error("Invalid Facility Type In spacecraft Load:", fac.type);
          facError = true;
        }
         
        if (!facError) {
          newFacility.site = spacecraft._id;
          newFacility.team = spacecraft.team;
    
          await newFacility.save(((err, newFacility) => {
            if (err) {
              logger.error(`New Spacecraft Facility Save Error: ${err}`);
              return console.error(`New Spacecraft Facility Save Error: ${err}`);
            }
            spacecraftDebugger(spacecraft.name, "Facility", fac.name, " add saved to facility collection.");
          }));
    
          spacecraft.facilities.push(facId);
        }
      }  

      await spacecraft.save((err, spacecraft) => {
        if (err) return console.error(`New Spacecraft Save Error: ${err}`);
        spacecraftDebugger(spacecraft.name + " add saved to spacecraft collection.");
        updateStats(spacecraft._id);
      });
    } else {       
      // Existing Spacecraft here ... update
      let id = spacecraft._id;
      
      spacecraft.name         = iData.name;
      spacecraft.siteCode     = iData.code;
      spacecraft.baseDefenses = iData.baseDefenses;
      spacecraft.baseDefenses = iData.baseDefenses;
      spacecraft.shipType     = iData.shipType;
      spacecraft.status       = iData.status;
      spacecraft.stats        = iData.stats;

      if (iData.parentCode2 != ""){
        let team = await Team.findOne({ teamCode: iData.parentCode2 });  
        if (!team) {
          spacecraftDebugger("Spacecraft Load Team Error, Update Spacecraft:", iData.name, " Team: ", iData.parentCode2);
        } else {
          spacecraft.team = team._id;
          spacecraftDebugger("Spacecraft Load Update Team Found, Spacecraft:", iData.name, " Team: ", iData.parentCode2, "Team ID:", team._id);
        }
      }  
      
      if (iData.parentCode1 != ""){
        let country = await Country.findOne({ code: iData.parentCode1 });  
        if (!country) {
          spacecraftDebugger("Spacecraft Load Country Error, Update Spacecraft:", iData.name, " Country: ", iData.parentCode1);
        } else {
          spacecraft.country = country._id;
          spacecraft.zone    = country.zone;
          spacecraftDebugger("Spacecraft Load Country Found, Update Spacecraft:", iData.name, " Country: ", iData.parentCode1, "Country ID:", country._id);
        }      
      }

      const { error } = validateSpacecraft(spacecraft); 
      if (error) {
        // remove associated facility records
        for (let j = 0; j < spacecraft.facilities.length; ++j ) {
          facilityId = spacecraft.facilities[j];
          let facilityDel = await Facility.findByIdAndRemove(facilityId);
          if (facilityDel = null) {
            spacecraftDebugger(`The Spacecraft Facility with the ID ${facilityId} was not found!`);
          }
        }
        spacecraftDebugger("Spacecraft Update Validate Error", iData.name, error.message);
        return
      }
   
      // create facility records for spacecraft and store ID in spacecraft.facilities
      // create facility records for spacecraft and store ID in spacecraft.facilities
      spacecraft.facilities = [];
      for (let i = 0; i < iData.facilities.length; ++i ) {
        let fac = iData.facilities[i];
        let facError = false;
        let facType  = fac.type;
        let facId    = null;
        //switch not working ... using if else
        if (facType == 'Factory') {
          newFacility = await new Factory(fac);
          facId = newFacility._id;
        } else if (facType == 'Lab') {
          newFacility = await new Lab(fac);
          facId = newFacility._id;
        } else if (facType == 'Hanger') {
          newFacility = await new Hanger(fac);
          facId = newFacility._id;
        } else {
          logger.error("Invalid Facility Type In spacecraft Load:", fac.type);
          facError = true;
        }
         
        if (!facError) {
          newFacility.site = spacecraft._id;
          newFacility.team = spacecraft.team;
    
          await newFacility.save(((err, newFacility) => {
            if (err) {
              logger.error(`New Spacecraft Facility Save Error: ${err}`);
              return console.error(`New Spacecraft Facility Save Error: ${err}`);
            }
            spacecraftDebugger(spacecraft.name, "Facility", fac.name, " add saved to facility collection.");
          }));
    
          spacecraft.facilities.push(facId)              
        }
      }  

      spacecraft.systems = [];
      for (let sys of iData.loadout) {
        let sysRef = systems[systems.findIndex(system => system.name === sys )];
        //console.log("jeff in spacecraft systems ", sys, "sysRef:", sysRef);
        if (sysRef) {
          newSystem = await new System(sysRef);
          newSystem.team         = spacecraft.team;
          newSystem.manufacturer = spacecraft.team;  
          //console.log("jeff in spacecraft before systems save ... sysRef:", sysRef);            
          await newSystem.save(((err, newSystem) => {
            if (err) {
              logger.error(`New Spacecraft System Save Error: ${err}`);
              return console.error(`New Spacecraft System Save Error: ${err}`);
            }
            logger.debug(`spacecraft.name, system ${sys} add saved to system collection.`);
          }));

          spacecraft.systems.push(newSystem._id)

        } else {
          logger.debug(`Error in creation of system ${sys} for  ${spacecraft.name}`);
        }
      }
            
      await spacecraft.save((err, spacecraft) => {
        if (err) return console.error(`Update Spacecraft Save Error: ${err}`);
        spacecraftDebugger(spacecraft.name + " add saved to spacecraft collection.");
        updateStats(spacecraft._id);
      });
    }
  } catch (err) {
    spacecraftDebugger('Catch Spacecraft Error:', err.message);
    return;
}

};

async function deleteAllSpacecraft(doLoad) {
  
  spacecraftDebugger("Jeff in deleteAllSpacecrafts", doLoad);    
  if (!doLoad) return;

  try {
    for await (const spacecraft of Spacecraft.find()) {    
      let id = spacecraft._id;
      try {
        // remove associated facility records
        for (let j = 0; j < spacecraft.facilities.length; ++j ) {
          facilityId = spacecraft.facilities[j];
          let facilityDel = await Facility.findByIdAndRemove(facilityId);
          if (facilityDel = null) {
            spacecraftDebugger(`The Spacecraft Facility with the ID ${facilityId} was not found!`);
          }
        }
        let spacecraftDel = await Spacecraft.findByIdAndRemove(id);
        if (spacecraftDel = null) {
          spacecraftDebugger(`The Spacecraft with the ID ${id} was not found!`);
        }
      } catch (err) {
        spacecraftDebugger('Spacecraft Delete All Error:', err.message);
      }
    }        
    spacecraftDebugger("All Spacecrafts succesfully deleted!");
  } catch (err) {
    spacecraftDebugger(`Delete All Spacecrafts Catch Error: ${err.message}`);
  }
};  

module.exports = runSpacecraftLoad;