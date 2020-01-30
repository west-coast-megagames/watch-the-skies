const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initbase.json', 'utf8');
const baseDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const baseLoadDebugger = require('debug')('app:baseLoad');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Base Model - Using Mongoose Model
const { Base, validateBase } = require('../../models/base');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runBaseLoad(runFlag){
  try {  
    //baseLoadDebugger("Jeff in runbaseLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllBases(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    baseLoadDebugger('Catch runbaseLoad Error:', err.message);
    return; 
  }
};

async function initLoad(doLoad) {
  
  //baseLoadDebugger("Jeff in initLoad", doLoad, baseDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < baseDataIn.length; ++i ) {
    
    //baseLoadDebugger("Jeff in runbaseLoad loop", i, baseDataIn[i].name );    
    //baseLoadDebugger("Jeff in runbaseLoad loop", i, baseDataIn[i] );
    
    await loadBase(baseDataIn[i]);
  }
};

async function loadBase(iData){
  try {   
    let base = await Base.findOne( { baseName: iData.name } );
    if (!base) {
       // New Base here
       let base = new Base({ 
           baseName: iData.name,
           baseCode: iData.code
        }); 

        let { error } = validateBase(base); 
        if (error) {
          baseLoadDebugger("New Base Validate Error", iData.name, error.message);
          return;
        }
        
        base.facilities   = iData.facilities;
        base.baseDefenses = iData.baseDefenses;

        if (iData.parentCode2 != ""){
          let team = await Team.findOne({ teamCode: iData.parentCode2 });  
          if (!team) {
            baseLoadDebugger("Base Load Team Error, New Base:", iData.name, " Team: ", iData.parentCode2);
          } else {
            base.team  = team._id;
            baseLoadDebugger("Base Load Team Found, Base:", iData.name, " Team: ", iData.parentCode1, "Team ID:", team._id);
          }
        }      

        if (iData.parentCode1 != ""){
          let country = await Country.findOne({ code: iData.parentCode1 });  
          if (!country) {
            baseLoadDebugger("Base Load Country Error, New Base:", iData.name, " Country: ", iData.parentCode1);
          } else {
            base.country = country._id;
            baseLoadDebugger("Base Load Country Found, New Base:", iData.name, " Country: ", iData.parentCode1, "Country ID:", country._id);
          }      
        }
        
        await base.save((err, base) => {
          if (err) return console.error(`New Base Save Error: ${err}`);
          baseLoadDebugger(base.baseName + " add saved to base collection.");
        });
    } else {       
      // Existing Base here ... update
      let id = base._id;
      
      base.baseName     = iData.name;
      base.baseCode     = iData.code;
      base.facilities   = iData.facilities;
      base.baseDefenses = iData.baseDefenses;

      if (iData.parentCode2 != ""){
        let team = await Team.findOne({ teamCode: iData.parentCode2 });  
        if (!team) {
          baseLoadDebugger("Base Load Team Error, Update Base:", iData.name, " Team: ", iData.parentCode2);
        } else {
          base.team = team._id;
          baseLoadDebugger("Base Load Update Team Found, Base:", iData.name, " Team: ", iData.parentCode2, "Team ID:", team._id);
        }
      }  
      
      if (iData.parentCode1 != ""){
        let country = await Country.findOne({ code: iData.parentCode1 });  
        if (!country) {
          baseLoadDebugger("Base Load Country Error, Update Base:", iData.name, " Country: ", iData.parentCode1);
        } else {
          base.country = country._id;
          baseLoadDebugger("Base Load Country Found, Update Base:", iData.name, " Country: ", iData.parentCode1, "Country ID:", country._id);
        }      
      }

      const { error } = validateBase(base); 
      if (error) {
        baseLoadDebugger("Base Update Validate Error", iData.name, error.message);
        return
      }
   
      await base.save((err, base) => {
      if (err) return console.error(`Base Update Save Error: ${err}`);
      baseLoadDebugger(base.baseName + " update saved to base collection.");
      });
    }
  } catch (err) {
    baseLoadDebugger('Catch Base Error:', err.message);
    return;
}

};

async function deleteAllBases(doLoad) {
  
  baseLoadDebugger("Jeff in deleteAllBases", doLoad);    
  if (!doLoad) return;

  try {
    for await (const base of Base.find()) {    
      let id = base._id;
      try {
        let baseDel = await Base.findByIdAndRemove(id);
        if (baseDel = null) {
          baseLoadDebugger(`The Zone with the ID ${id} was not found!`);
        }
      } catch (err) {
        baseLoadDebugger('Base Delete All Error:', err.message);
      }
    }        
    baseLoadDebugger("All Bases succesfully deleted!");
  } catch (err) {
    baseLoadDebugger(`Delete All Bases Catch Error: ${err.message}`);
  }
};  

module.exports = runBaseLoad;