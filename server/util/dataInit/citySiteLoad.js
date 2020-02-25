const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initCitySite.json', 'utf8');
const cityDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const citySiteLoadDebugger = require('debug')('app:citySiteLoad');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// City Model - Using Mongoose Model
const { CitySite, validateCity } = require('../../models/sites/citySite');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team/team');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runcitySiteLoad(runFlag){
  try {  
    //citySiteLoadDebugger("Jeff in runcitySiteLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllCitys(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    citySiteLoadDebugger('Catch runcitySiteLoad Error:', err.message);
    return; 
  }
};

async function initLoad(doLoad) {
  
  //citySiteLoadDebugger("Jeff in initLoad", doLoad, cityDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < cityDataIn.length; ++i ) {
    
    //citySiteLoadDebugger("Jeff in runcitySiteLoad loop", i, cityDataIn[i].name );    
    //citySiteLoadDebugger("Jeff in runcitySiteLoad loop", i, cityDataIn[i] );
    
    await loadCity(cityDataIn[i]);
  }
};

async function loadCity(iData){
  try {   
    let citySite = await CitySite.findOne( { name: iData.name } );
    if (!citySite) {
       // New City here
       let citySite = new CitySite({ 
           name: iData.name,
           siteCode: iData.code,
           geoDMS: { 
             latDMS: iData.latDMS,
             longDMS: iData.longDMS
           },
           geoDecimal: {
             latDecimal: iData.latDecimal,
             longDecimal: iData.longDecimal
           },
           dateline: iData.dateline
        }); 

        let { error } = validateCity(citySite); 
        if (error) {
          citySiteLoadDebugger("New CitySite Validate Error", iData.name, error.message);
          return;
        }
        
        if (iData.parentCode1 != ""){
          let country = await Country.findOne({ code: iData.parentCode1 });  
          if (!country) {
            citySiteLoadDebugger("CitySite Load Country Error, New City:", iData.name, " Country: ", iData.parentCode1);
          } else {
            citySite.country = country._id;
            citySite.zone    = country.zone;
            citySiteLoadDebugger("CitySite Load Country Found, New City:", iData.name, " Country: ", iData.parentCode1, "Country ID:", country._id);
          }      
        }
        
        if (iData.parentCode2 != ""){
          let team = await Team.findOne({ teamCode: iData.parentCode2 });  
          if (!team) {
            citySiteLoadDebugger("CitySite Load Team Error, New City:", iData.name, " Team: ", iData.parentCode2);
          } else {
            citySite.team = team._id;
            citySiteLoadDebugger("CitySite Load Update Team Found, City:", iData.name, " Team: ", iData.parentCode2, "Team ID:", team._id);
          }
        }  

        await citySite.save((err, citySite) => {
          if (err) return console.error(`New CitySite Save Error: ${err}`);
          citySiteLoadDebugger(citySite.name + " add saved to citySite collection.");
        });
    } else {       
      // Existing City here ... update
      let id = citySite._id;
      
      citySite.name                   = iData.name;
      citySite.siteCode               = iData.code;
      citySite.geoDMS.latDMS          = iData.latDMS;
      citySite.geoDMS.longDMS         = iData.longDMS;
      citySite.geoDecimal.latDecimal  = iData.latDecimal;
      citySite.geoDecimal.longDecimal = iData.longDecimal;
      citySite.dateline               = iData.dateline;
      
      if (iData.parentCode2 != ""){
        let team = await Team.findOne({ teamCode: iData.parentCode2 });  
        if (!team) {
          citySiteLoadDebugger("CitySite Load Team Error, Update City:", iData.name, " Team: ", iData.parentCode2);
        } else {
          citySite.team = team._id;
          citySiteLoadDebugger("CitySite Load Update Team Found, City:", iData.name, " Team: ", iData.parentCode2, "Team ID:", team._id);
        }
      }  
      
      if (iData.parentCode1 != ""){
        let country = await Country.findOne({ code: iData.parentCode1 });  
        if (!country) {
          citySiteLoadDebugger("CitySite Load Country Error, Update City:", iData.name, " Country: ", iData.parentCode1);
        } else {
          citySite.country = country._id;
          citySite.zone    = country.zone;
          citySiteLoadDebugger("CitySite Load Country Found, Update City:", iData.name, " Country: ", iData.parentCode1, "Country ID:", country._id);
        }      
      }

      const { error } = validateCity(citySite); 
      if (error) {
        citySiteLoadDebugger("CitySite Update Validate Error", iData.name, error.message);
        return
      }
   
      await citySite.save((err, citySite) => {
      if (err) return console.error(`City Update Save Error: ${err}`);
      citySiteLoadDebugger(citySite.name + " update saved to city collection.");
      });
    }
  } catch (err) {
    citySiteLoadDebugger('Catch City Error:', err.message);
    return;
}

};

async function deleteAllCitys(doLoad) {
  
  citySiteLoadDebugger("Jeff in deleteAllCitySites", doLoad);    
  if (!doLoad) return;

  try {
    for await (const citySite of CitySite.find()) {    
      let id = citySite._id;
      try {
        let cityDel = await CitySite.findByIdAndRemove(id);
        if (cityDel = null) {
          citySiteLoadDebugger(`The CitySite with the ID ${id} was not found!`);
        }
      } catch (err) {
        citySiteLoadDebugger('CitySite Delete All Error:', err.message);
      }
    }        
    citySiteLoadDebugger("All CitySites succesfully deleted!");
  } catch (err) {
    citySiteLoadDebugger(`Delete All CitySites Catch Error: ${err.message}`);
  }
};  

module.exports = runcitySiteLoad;