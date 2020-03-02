const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initBaseSite.json', 'utf8');
const baseDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const baseSiteLoadDebugger = require('debug')('app:baseLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Base Model - Using Mongoose Model
const { BaseSite, validateBase } = require('../../models/sites/baseSite');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team/team');
const { Facility } = require('../../models/gov/facility/facility');
const { Lab } = require('../../models/gov/facility/lab');
const { Hanger } = require('../../models/gov/facility/hanger');
const { Factory } = require('../../models/gov/facility/factory');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runbaseSiteLoad(runFlag){
  try {  
    //baseSiteLoadDebugger("Jeff in runbaseSiteLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllBases(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    baseSiteLoadDebugger('Catch runbaseSiteLoad Error:', err.message);
    return; 
  }
};

async function initLoad(doLoad) {
  
  //baseSiteLoadDebugger("Jeff in initLoad", doLoad, baseDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < baseDataIn.length; ++i ) {
    
    //baseSiteLoadDebugger("Jeff in runbaseSiteLoad loop", i, baseDataIn[i].name );    
    //baseSiteLoadDebugger("Jeff in runbaseSiteLoad loop", i, baseDataIn[i] );
    
    await loadBase(baseDataIn[i]);
  }
};

async function loadBase(iData){
  try {   
    let baseSite = await BaseSite.findOne( { name: iData.name } );
    if (!baseSite) {
      // New Base here
      let baseSite = new BaseSite({ 
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
      let { error } = validateBase(baseSite); 
      if (error) {
        // remove associated facility records
        for (let j = 0; j < baseSite.Inf1C.length; ++j ) {
          facilityId = baseSite.Inf1C[j];
          let facilityDel = await Facility.findByIdAndRemove(facilityId);
          if (facilityDel = null) {
            baseSiteLoadDebugger(`The Base Facility with the ID ${facilityId} was not found!`);
          }
        }
        baseSiteLoadDebugger("New BaseSite Validate Error", iData.name, error.message);
        return;
      }
      baseSite.baseDefenses = iData.baseDefenses;

      if (iData.teamCode != ""){
        let team = await Team.findOne({ teamCode: iData.teamCode });  
        if (!team) {
          baseSiteLoadDebugger("BaseSite Load Team Error, New Base:", iData.name, " Team: ", iData.teamCode);
        } else {
          baseSite.team  = team._id;
          baseSiteLoadDebugger("BaseSite Load Team Found, Base:", iData.name, " Team: ", iData.countryCode, "Team ID:", team._id);
        }
      }      

      if (iData.countryCode != ""){
        let country = await Country.findOne({ code: iData.countryCode });  
        if (!country) {
          baseSiteLoadDebugger("BaseSite Load Country Error, New Base:", iData.name, " Country: ", iData.countryCode);
        } else {
          baseSite.country = country._id;
          baseSite.zone    = country.zone;
          baseSiteLoadDebugger("BaseSite Load Country Found, New Base:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }      
      }

      // create facility records for baseSite and store ID in baseSite.Inf1C
      baseSite.Inf1C = [];
      for (let i = 0; i < iData.Inf1C.length; ++i ) {
        let fac = iData.Inf1C[i];
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
          logger.error("Invalid Facility Type In baseSite Load:", fac.type);
          facError = true;
        }
         
        if (!facError) {
          newFacility.site = baseSite._id;
          newFacility.team = baseSite.team;
    
          await newFacility.save(((err, newFacility) => {
            if (err) {
              logger.error(`New BaseSite Facility Save Error: ${err}`);
              return console.error(`New BaseSite Facility Save Error: ${err}`);
            }
            baseSiteLoadDebugger(baseSite.name, "Facility", fac.name, " add saved to facility collection.");
          }));
    
          baseSite.Inf1C.push(facId);
        }
      }  

      await baseSite.save((err, baseSite) => {
        if (err) return console.error(`New BaseSite Save Error: ${err}`);
        baseSiteLoadDebugger(baseSite.name + " add saved to baseSite collection.");
      });
    } else {       
      // Existing Base here ... update
      let id = baseSite._id;
      
      baseSite.name         = iData.name;
      baseSite.siteCode     = iData.code;
      baseSite.baseDefenses = iData.baseDefenses;

      if (iData.teamCode != ""){
        let team = await Team.findOne({ teamCode: iData.teamCode });  
        if (!team) {
          baseSiteLoadDebugger("BaseSite Load Team Error, Update Base:", iData.name, " Team: ", iData.teamCode);
        } else {
          baseSite.team = team._id;
          baseSiteLoadDebugger("BaseSite Load Update Team Found, Base:", iData.name, " Team: ", iData.teamCode, "Team ID:", team._id);
        }
      }  
      
      if (iData.countryCode != ""){
        let country = await Country.findOne({ code: iData.countryCode });  
        if (!country) {
          baseSiteLoadDebugger("BaseSite Load Country Error, Update Base:", iData.name, " Country: ", iData.countryCode);
        } else {
          baseSite.country = country._id;
          baseSite.zone    = country.zone;
          baseSiteLoadDebugger("BaseSite Load Country Found, Update Base:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }      
      }

      const { error } = validateBase(baseSite); 
      if (error) {
        // remove associated facility records
        for (let j = 0; j < baseSite.Inf1C.length; ++j ) {
          facilityId = baseSite.Inf1C[j];
          let facilityDel = await Facility.findByIdAndRemove(facilityId);
          if (facilityDel = null) {
            baseSiteLoadDebugger(`The Base Facility with the ID ${facilityId} was not found!`);
          }
        }
        baseSiteLoadDebugger("BaseSite Update Validate Error", iData.name, error.message);
        return
      }
   
      // create facility records for baseSite and store ID in baseSite.Inf1C
      // create facility records for baseSite and store ID in baseSite.Inf1C
      baseSite.Inf1C = [];
      for (let i = 0; i < iData.Inf1C.length; ++i ) {
        let fac = iData.Inf1C[i];
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
          logger.error("Invalid Facility Type In baseSite Load:", fac.type);
          facError = true;
        }
         
        if (!facError) {
          newFacility.site = baseSite._id;
          newFacility.team = baseSite.team;
    
          await newFacility.save(((err, newFacility) => {
            if (err) {
              logger.error(`New BaseSite Facility Save Error: ${err}`);
              return console.error(`New BaseSite Facility Save Error: ${err}`);
            }
            baseSiteLoadDebugger(baseSite.name, "Facility", fac.name, " add saved to facility collection.");
          }));
    
          baseSite.Inf1C.push(facId)              
        }
      }  
      await baseSite.save((err, baseSite) => {
        if (err) return console.error(`Update BaseSite Save Error: ${err}`);
        baseSiteLoadDebugger(baseSite.name + " add saved to baseSite collection.");
      });
    }
  } catch (err) {
    baseSiteLoadDebugger('Catch Base Error:', err.message);
    return;
}

};

async function deleteAllBases(doLoad) {
  
  baseSiteLoadDebugger("Jeff in deleteAllBaseSites", doLoad);    
  if (!doLoad) return;

  try {
    for await (const baseSite of BaseSite.find()) {    
      let id = baseSite._id;
      try {
        // remove associated facility records
        for (let j = 0; j < baseSite.Inf1C.length; ++j ) {
          facilityId = baseSite.Inf1C[j];
          let facilityDel = await Facility.findByIdAndRemove(facilityId);
          if (facilityDel = null) {
            baseSiteLoadDebugger(`The Base Facility with the ID ${facilityId} was not found!`);
          }
        }
        let baseDel = await BaseSite.findByIdAndRemove(id);
        if (baseDel = null) {
          baseSiteLoadDebugger(`The BaseSite with the ID ${id} was not found!`);
        }
      } catch (err) {
        baseSiteLoadDebugger('BaseSite Delete All Error:', err.message);
      }
    }        
    baseSiteLoadDebugger("All BaseSites succesfully deleted!");
  } catch (err) {
    baseSiteLoadDebugger(`Delete All BaseSites Catch Error: ${err.message}`);
  }
};  

module.exports = runbaseSiteLoad;