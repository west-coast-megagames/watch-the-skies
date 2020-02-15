const fs = require('fs')
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initinterceptor.json', 'utf8');
const interceptorDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const interceptorLoadDebugger = require('debug')('app:interceptorLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Interceptor Model - Using Mongoose Model
const { updateStats } = require('../../models/ops/aircraft');
const { Interceptor, validateInterceptor } = require('../../models/ops/interceptor');
const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team');
const { Base } = require('../../models/base');
const { System } = require('../../models/ops/systems');
const { loadSystems, systems } = require('../../wts/construction/systems/systems');
const { BaseSite } = require('../../models/sites/baseSite');
const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runinterceptorLoad(runFlag){
  try {  
    //interceptorLoadDebugger("Jeff in runinterceptorLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      await loadSystems();                         // load wts/json/systems.json data into array    
      
      await deleteAllInterceptors(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    interceptorLoadDebugger('Catch runinterceptorLoad Error:', err.message);
    return false; 
  }
};

async function initLoad(doLoad) {
  
  //interceptorLoadDebugger("Jeff in initLoad", doLoad, interceptorDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < interceptorDataIn.length; ++i ) {
    
    //interceptorLoadDebugger("Jeff in runinterceptorLoad loop", i, interceptorDataIn[i].name );    
    //interceptorLoadDebugger("Jeff in runinterceptorLoad loop", i, interceptorDataIn[i] );
    
    await loadInterceptor(interceptorDataIn[i]);
  }
};

async function loadInterceptor(iData){
  try {   
    //interceptorLoadDebugger("Jeff in loadInterceptor ", iData.name); 
    let interceptor = await Interceptor.findOne( { name: iData.name } );
    if (!interceptor) {
       // New Interceptor here
       let interceptor = new Interceptor({ 
           name: iData.name,
           type: iData.type,
           code: iData.code
        }); 

        interceptor.stats  = iData.stats;
        interceptor.status = iData.status;

        if (iData.parentCode1 != ""){
          let team = await Team.findOne({ teamCode: iData.parentCode1 });  
          if (!team) {
            interceptorLoadDebugger("Interceptor Load Team Error, New Interceptor:", iData.name, " Team: ", iData.parentCode1);
          } else {
            interceptor.team = team._id;
            interceptorLoadDebugger("Interceptor Load Team Found, Interceptor:", iData.name, " Team: ", iData.parentCode1, "Team ID:", team._id);
          }
        }      

        // create systems records for interceptor and store ID in interceptor.system
        //console.log("jeff interceptor systems  iData.loadout", iData.loadout);
        interceptor.systems = [];
        for (let sys of iData.loadout) {
          let sysRef = systems[systems.findIndex(system => system.name === sys )];
          //console.log("jeff in interceptor systems ", sys, "sysRef:", sysRef);
          if (sysRef) {
            newSystem = await new System(sysRef);
              
            await newSystem.save(((err, newSystem) => {
              if (err) {
                logger.error(`New Interceptor System Save Error: ${err}`);
                return console.error(`New Interceptor System Save Error: ${err}`);
              }
              interceptorLoadDebugger(interceptor.name, "system", sys, " add saved to system collection.");
            }));

            interceptor.systems.push(newSystem._id)
          } else {
            interceptorLoadDebugger('Error in creation of system', sys, "for ", interceptor.name);
          }
        }

        if (iData.parentCode1 != ""){
          let team = await Team.findOne({ teamCode: iData.parentCode1 });  
          if (!team) {
            interceptorLoadDebugger("Interceptor Load Team Error, New Interceptor:", iData.name, " Team: ", iData.parentCode1);
          } else {
            interceptor.team = team._id;
            interceptorLoadDebugger("Interceptor Load Team Found, Interceptor:", iData.name, " Team: ", iData.parentCode1, "Team ID:", team._id);
          }
        }      

        if (iData.parentCode2 != "" && iData.parentCode2 != "undefined" ){
          let baseSite = await BaseSite.findOne({ siteCode: iData.parentCode2 });  
          if (!baseSite) {
            interceptorLoadDebugger("Interceptor Load Base Error, New Interceptor:", iData.name, " Base: ", iData.parentCode2);
          } else {
            interceptor.base = baseSite._id;
            interceptor.site = baseSite._id;
            interceptorLoadDebugger("Interceptor Load Base Found, Interceptor:", iData.name, " Base: ", iData.parentCode2, "Base ID:", baseSite._id);
          }
        }      

        if (iData.zone != ""){
          let zone = await Zone.findOne({ zoneCode: iData.zone });  
          if (!zone) {
            interceptorLoadDebugger("Interceptor Load Zone Error, New Interceptor:", iData.name, " Zone: ", iData.zone);
          } else {
            interceptor.zone = zone._id;
            interceptorLoadDebugger("Interceptor Load Zone Found, New Interceptor:", iData.name, " Zone: ", iData.zone, "Zone ID:", zone._id);
          }      
        }

        if (iData.country != ""){
          let country = await Country.findOne({ code: iData.country });  
          if (!country) {
            interceptorLoadDebugger("Interceptor Load Country Error, New Interceptor:", iData.name, " Country: ", iData.country);
          } else {
            interceptor.country = country._id;
            interceptorLoadDebugger("Interceptor Load Country Found, New Interceptor:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
          }      
        }

        let { error } = validateInterceptor(interceptor); 
        if (error) {
          interceptorLoadDebugger("New Interceptor Validate Error", interceptor.name, error.message);
          // remove associated systems records
          for (let j = 0; j < interceptor.systems.length; ++j ) {
            sysId = interceptor.systems[j];
            let systemDel = await System.findByIdAndRemove(sysId);
            if (systemDel = null) {
              console.log(`The Interceptor System with the ID ${sysId} was not found!`);
            }
            console.log(`The Interceptor System with the ID ${sysId} was DELETED ... Interceptor validate error!`);
          }      
          return; 
        }

        await interceptor.save((err, interceptor) => {
          if (err) return console.error(`New Interceptor Save Error: ${err}`);
          interceptorLoadDebugger(interceptor.name + " add saved to interceptor collection.");
          updateStats(interceptor._id);
        });
    } else {       
      // Existing Interceptor here ... update
      let id = interceptor._id;
      
      interceptor.name        = iData.name;
      interceptor.type        = iData.type;
      interceptor.code        = iData.code;
      interceptor.stats       = iData.stats;
      interceptor.status      = iData.status;

      // create systems records for interceptor and store ID in interceptor.system
      if (iData.loadout.length != 0){
        // create systems records for interceptor and store ID in interceptor.system
        interceptor.systems = [];
        for (let sys of iData.loadout) {
          let sysRef = systems[systems.findIndex(system => system.name === sys )];
          newSystem = await new System(sysRef);
          await newSystem.save(((err, newSystem) => {
          if (err) return console.error(`New Interceptor System Save Error: ${err}`);
          //interceptorLoadDebugger(interceptor.name, "system", sys, " add saved to system collection.");
          }));

          interceptor.systems.push(newSystem._id)
        }
      }

      if (iData.parentCode1 != ""){
        let team = await Team.findOne({ teamCode: iData.parentCode1 });  
        if (!team) {
          interceptorLoadDebugger("Interceptor Load Team Error, Update Interceptor:", iData.name, " Team: ", iData.parentCode1);
        } else {
          interceptor.team = team._id;
          interceptorLoadDebugger("Interceptor Load Update Team Found, Interceptor:", iData.name, " Team: ", iData.parentCode1, "Team ID:", team._id);
        }
      }  
      
      if (iData.parentCode2 != "" && iData.parentCode2 != "undefined" ){
        let baseSite = await BaseSite.findOne({ siteCode: iData.parentCode2 });  
        if (!baseSite) {
          interceptorLoadDebugger("Interceptor Load Base Error, Update Interceptor:", iData.name, " Base: ", iData.parentCode2);
        } else {
          interceptor.base = baseSite._id;
          interceptor.site = baseSite._id;
          interceptorLoadDebugger("Interceptor Load Update Base Found, Interceptor:", iData.name, " Base: ", iData.parentCode2, "Base ID:", baseSite._id);
        }
      }      

      if (iData.zone != ""){
        let zone = await Zone.findOne({ zoneCode: iData.zone });  
        if (!zone) {
          interceptorLoadDebugger("Interceptor Load Zone Error, Update Interceptor:", iData.name, " Zone: ", iData.zone);
        } else {
          interceptor.zone = zone._id;
          interceptorLoadDebugger("Interceptor Load Zone Found, Update Interceptor:", iData.name, " Zone: ", iData.zone, "Zone ID:", zone._id);
        }      
      }

      if (iData.country != ""){
        let country = await Country.findOne({ code: iData.country });  
        if (!country) {
          interceptorLoadDebugger("Interceptor Load Country Error, Update Interceptor:", iData.name, " Country: ", iData.country);
        } else {
          interceptor.country = country._id;
          interceptorLoadDebugger("Interceptor Load Country Found, Update Interceptor:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
        }      
      }

      const { error } = validateInterceptor(interceptor); 
      if (error) {
        interceptorLoadDebugger("Interceptor Update Validate Error", iData.name, error.message);
        return
      }
   
      await interceptor.save((err, interceptor) => {
        if (err) return console.error(`Interceptor Update Save Error: ${err}`);
        interceptorLoadDebugger(interceptor.name + " update saved to interceptor collection.");
        updateStats(interceptor._id);
      });
    }
  } catch (err) {
    interceptorLoadDebugger('Catch Interceptor Error:', err.message);
    return;
}

};

async function deleteAllInterceptors(doLoad) {
  
  interceptorLoadDebugger("Jeff in deleteAllInterceptors", doLoad);    
  if (!doLoad) return;

  try {
    for await (const interceptor of Interceptor.find()) {    
      let id = interceptor._id;

      //interceptorLoadDebugger("Jeff in deleteAllInterceptors loop", interceptor.name); 
      try {

        // remove associated systems records
        for (let j = 0; j < interceptor.systems.length; ++j ) {
          sysId = interceptor.systems[j];
          let systemDel = await System.findByIdAndRemove(sysId);
          if (systemDel = null) {
            interceptorLoadDebugger(`The Interceptor System with the ID ${sysId} was not found!`);
          }
        }

        let interceptorDel = await Interceptor.findByIdAndRemove(id);
        if (interceptorDel = null) {
          interceptorLoadDebugger(`The Interceptor with the ID ${id} was not found!`);
        }
        //interceptorLoadDebugger("Jeff in deleteAllInterceptors loop after remove", interceptor.name); 
      } catch (err) {
        interceptorLoadDebugger('Interceptor Delete All Error:', err.message);
      }
    }        
    interceptorLoadDebugger("All Interceptors succesfully deleted!");
  } catch (err) {
    interceptorLoadDebugger(`Delete All Interceptors Catch Error: ${err.message}`);
  }
};  

module.exports = runinterceptorLoad;