const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initBaseSite.json', 'utf8');
const baseDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const baseSiteLoadDebugger = require('debug')('app:baseLoad');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Base Model - Using Mongoose Model
const { BaseSite, validateBase } = require('../../models/sites/baseSite');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team');

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
    let baseSite = await BaseSite.findOne( { baseName: iData.name } );
    if (!baseSite) {
       // New Base here
       let baseSite = new BaseSite({ 
           baseName: iData.name,
           siteCode: iData.code
        }); 

        let { error } = validateBase(baseSite); 
        if (error) {
          baseSiteLoadDebugger("New BaseSite Validate Error", iData.name, error.message);
          return;
        }
        
        baseSite.facilities   = iData.facilities;
        baseSite.baseDefenses = iData.baseDefenses;

        if (iData.parentCode2 != ""){
          let team = await Team.findOne({ teamCode: iData.parentCode2 });  
          if (!team) {
            baseSiteLoadDebugger("BaseSite Load Team Error, New Base:", iData.name, " Team: ", iData.parentCode2);
          } else {
            baseSite.team  = team._id;
            baseSiteLoadDebugger("BaseSite Load Team Found, Base:", iData.name, " Team: ", iData.parentCode1, "Team ID:", team._id);
          }
        }      

        if (iData.parentCode1 != ""){
          let country = await Country.findOne({ code: iData.parentCode1 });  
          if (!country) {
            baseSiteLoadDebugger("BaseSite Load Country Error, New Base:", iData.name, " Country: ", iData.parentCode1);
          } else {
            baseSite.country = country._id;
            baseSiteLoadDebugger("BaseSite Load Country Found, New Base:", iData.name, " Country: ", iData.parentCode1, "Country ID:", country._id);
          }      
        }
        
        await baseSite.save((err, baseSite) => {
          if (err) return console.error(`New BaseSite Save Error: ${err}`);
          baseSiteLoadDebugger(baseSite.baseName + " add saved to baseSite collection.");
        });
    } else {       
      // Existing Base here ... update
      let id = baseSite._id;
      
      baseSite.baseName     = iData.name;
      baseSite.siteCode     = iData.code;
      baseSite.facilities   = iData.facilities;
      baseSite.baseDefenses = iData.baseDefenses;

      if (iData.parentCode2 != ""){
        let team = await Team.findOne({ teamCode: iData.parentCode2 });  
        if (!team) {
          baseSiteLoadDebugger("BaseSite Load Team Error, Update Base:", iData.name, " Team: ", iData.parentCode2);
        } else {
          baseSite.team = team._id;
          baseSiteLoadDebugger("BaseSite Load Update Team Found, Base:", iData.name, " Team: ", iData.parentCode2, "Team ID:", team._id);
        }
      }  
      
      if (iData.parentCode1 != ""){
        let country = await Country.findOne({ code: iData.parentCode1 });  
        if (!country) {
          baseSiteLoadDebugger("BaseSite Load Country Error, Update Base:", iData.name, " Country: ", iData.parentCode1);
        } else {
          baseSite.country = country._id;
          baseSiteLoadDebugger("BaseSite Load Country Found, Update Base:", iData.name, " Country: ", iData.parentCode1, "Country ID:", country._id);
        }      
      }

      const { error } = validateBase(baseSite); 
      if (error) {
        baseSiteLoadDebugger("BaseSite Update Validate Error", iData.name, error.message);
        return
      }
   
      await baseSite.save((err, baseSite) => {
      if (err) return console.error(`Base Update Save Error: ${err}`);
      baseSiteLoadDebugger(baseSite.baseName + " update saved to base collection.");
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