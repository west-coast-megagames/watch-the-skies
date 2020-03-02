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
const { Spacecraft, validateSpacecraft } = require('../../models/sites/spacecraft');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team/team');
const { Facility } = require('../../models/gov/facility/facility');
const { Lab } = require('../../models/gov/facility/lab');
const { Hanger } = require('../../models/gov/facility/hanger');
const { Factory } = require('../../models/gov/facility/factory');
const { Zone } = require('../../models/zone');

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

      if (iData.teamCode != ""){
        let team = await Team.findOne({ teamCode: iData.teamCode });  
        if (!team) {
          spacecraftDebugger("Spacecraft Load Team Error, New Spacecraft:", iData.name, " Team: ", iData.teamCode);
        } else {
          spacecraft.team  = team._id;
          spacecraftDebugger("Spacecraft Load Team Found, Spacecraft:", iData.name, " Team: ", iData.countryCode, "Team ID:", team._id);
        }
      }      

      let { error } = validateSpacecraft(spacecraft); 
      if (error) {
        spacecraftDebugger("New Spacecraft Validate Error", iData.name, error.message);
        return;
      }
      spacecraft.baseDefenses = iData.baseDefenses;
      spacecraft.shipType     = iData.shipType;
      spacecraft.status       = iData.status;
      spacecraft.stats        = iData.stats;
      spacecraft.hidden       = iData.hidden;

      
      if (iData.countryCode != ""){
        let country = await Country.findOne({ code: iData.countryCode });  
        if (!country) {
          spacecraftDebugger("Spacecraft Load Country Error, New Spacecraft:", iData.name, " Country: ", iData.countryCode);
        } else {
          spacecraft.country = country._id;
          spacecraft.zone    = country.zone;
          spacecraftDebugger("Spacecraft Load Country Found, New Spacecraft:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }      
      }

      // create facility records for spacecraft 
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
        }
      }  

      await spacecraft.save((err, spacecraft) => {
        if (err) return console.error(`New Spacecraft Save Error: ${err}`);
        spacecraftDebugger(spacecraft.name + " add saved to spacecraft collection.");
        //updateStats(spacecraft._id);

        if (spacecraft.shipType === "Satellite") {
           addSatelliteToZone(spacecraft._id, spacecraft.zone, spacecraft.team);
        };
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
      spacecraft.hidden       = iData.hidden;

      if (iData.teamCode != ""){
        let team = await Team.findOne({ teamCode: iData.teamCode });  
        if (!team) {
          spacecraftDebugger("Spacecraft Load Team Error, Update Spacecraft:", iData.name, " Team: ", iData.teamCode);
        } else {
          spacecraft.team = team._id;
          spacecraftDebugger("Spacecraft Load Update Team Found, Spacecraft:", iData.name, " Team: ", iData.teamCode, "Team ID:", team._id);
        }
      }  
      
      if (iData.countryCode != ""){
        let country = await Country.findOne({ code: iData.countryCode });  
        if (!country) {
          spacecraftDebugger("Spacecraft Load Country Error, Update Spacecraft:", iData.name, " Country: ", iData.countryCode);
        } else {
          spacecraft.country = country._id;
          spacecraft.zone    = country.zone;
          spacecraftDebugger("Spacecraft Load Country Found, Update Spacecraft:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }      
      }

      const { error } = validateSpacecraft(spacecraft); 
      if (error) {
        spacecraftDebugger("Spacecraft Update Validate Error", iData.name, error.message);
        return
      }
   
      // create facility records for spacecraft
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
              logger.error(`Update Spacecraft Facility Save Error: ${err}`);
              return console.error(`Update Spacecraft Facility Save Error: ${err}`);
            }
            spacecraftDebugger(spacecraft.name, "Facility", fac.name, " add saved to facility collection.");
          }));
        }
      }  
            
      await spacecraft.save((err, spacecraft) => {
        if (err) return console.error(`Update Spacecraft Save Error: ${err}`);
        spacecraftDebugger(spacecraft.name + " add saved to spacecraft collection.");
        //updateStats(spacecraft._id);
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

async function addSatelliteToZone(satId, zoneId, teamId) {


  let useZoneId = zoneId;
  let team = await Team.findById( teamId );
  if (team) {
    spacecraftDebugger(`About to find home country for team ${team.name}`);
    if (team.homeCountry) {
      spacecraftDebugger(`Aboit to find home country for ${team.name} ${team.homeCountry}`);
      let country = await Country.findById( {"_id": team.homeCountry} );
      if (country) {
        if (country.zone) {
          useZoneId = country.zone;
          spacecraftDebugger(`Found home country ${country.name} zone ${country.zone} for ${team.name}`);
        }
      }
    }
  }

  let zoneUpd = await Zone.findById( useZoneId );

  if (!zoneUpd) {
    spacecraftDebugger(`Unable to add satellite with id ${satId} to zone with id ${useZoneId}`);
  } else {
    zoneUpd.satellite.push(satId);  
    await zoneUpd.save();
  }
}

module.exports = runSpacecraftLoad;