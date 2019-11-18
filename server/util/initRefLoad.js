const fs = require('fs')
const file = fs.readFileSync('./init-json/refdata.json', 'utf8');
const refDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const refLoadDebugger = require('debug')('app:refLoad');
const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Country Model - Using Mongoose Model
const { Zone, validateZone } = require('../models/zone');
const { Country } = require('../models/country'); 

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function runLoad(runFlag){
  if (!runFlag) return;
  if (runFlag) initLoad(runFlag);
  else return;
};

async function initLoad(doLoad) {
  
  if (!doLoad) return;

  for (let i = 0; i < refDataIn.length; ++i ) {
    
    if (refDataIn[i].type == "zone") {     
      if (refDataIn[i].loadFlag === "false") {
         await deleteZone(refDataIn[i].name, refDataIn[i].code, refDataIn[i].loadFlag);
      }
      else {
        await loadZone(refDataIn[i].name, refDataIn[i].code, refDataIn[i].loadFlag);
      }
    }

    if (refDataIn[i].type == "country") {
      //await loadCountry(refDataIn[i].name, refDataIn[i].code, refDataIn[i].loadFlag, refDataIn[i].parentCode1);
      refLoadDebugger("jeff in initLoad ... skipping country code ", refDataIn[i].code);
    }
  };
};

async function loadZone(zName, zCode, zLoadFlg){
  try {   
    let zone = await Zone.findOne( { zoneCode: zCode } );
    if (!zone) {
       // New Zone here
       if (zLoadFlg === "false") return;   // don't load if not true
       let zone = new Zone({ 
           zoneCode: zCode,
           zoneName: zName
        }); 

        let { error } = validateZone(zone); 
        if (error) {
          refLoadDebugger("New Zone Validate Error", zone.zoneCode, error.message);
          return;
        }
        
        zone.save((err, zone) => {
          if (err) return console.error(`New Zone Save Error: ${err}`);
          refLoadDebugger(zone.zoneName + " add saved to zones collection.");
        });
    } else {       
       // Existing Zone here ... update
       let id = zone._id;
      
       zone.zoneName = zName;
       zone.zoneCode = zCode;

       const { error } = validateZone(zone); 
       if (error) {
         refLoadDebugger("Zone Update Validate Error", zCode, zName, zLoadFlg, error.message);
         return
       }
   
       zone.save((err, zone) => {
       if (err) return console.error(`Zone Update Save Error: ${err}`);
          refLoadDebugger(zone.zoneName + " update saved to zones collection.");
       });
    }
  } catch (err) {
    refLoadDebugger('Error:', err.message);
    return;
}

};

async function deleteZone(zName, zCode, zLoadFlg){

  if (zLoadFlg === "true") return;   // shouldn't be here if flagged for load

  try {
    let delErrorFlag = false;
    for await (let zone of Zone.find( { zoneCode: zCode } )) {    
      try {
        let delId = zone._id;
        let zoneDel = await Zone.findByIdAndRemove(delId);
        if (zoneDel = null) {
          refLoadDebugger(`deleteZone: Zone with the ID ${delId} was not found!`);
          let delErrorFlag = true;
        }
      } catch (err) {
        refLoadDebugger('deleteZone Error 1:', err.message);
        let delErrorFlag = true;
      }
    }        
    if (!delErrorFlag) {
       refLoadDebugger("All Zones succesfully deleted for Code:", zCode);
    } else {
       refLoadDebugger("Some Error In Zones delete for Code:", zCode);
    }
  } catch (err) {
    refLoadDebugger(`deleteZone Error 2: ${err.message}`);
  }
};

function loadCountry(cName, cCode, cLoadFlg, zCode){
  
  try {   

    let zone = Zone.find({ zoneCode: zCode });
refLoadDebugger("jeff here in load country after zone find: ", zCode, zone.length);    
    if (zone.length) {
      let zoneId = zone.id;
      let zoneName = zone.zoneName;
    } else {
      refLoadDebugger("Country Load Zone Error, Country:", cCode, " Zone: ", zCode);
    }
      
      let docs = Country.find( { code: cCode } );
      if (!docs.length) {
         // New Country here
         if (cLoadFlg === "false") return;   // don't load if flag is not true

         let country = new Country({ 
             code: cCode,
             name: cName,
             activeFlag: cLoadFlg,
             zone: {
                _id: zoneId,
                zoneName: zoneName
            }
          }); 
      
         let { error } = Country.validateCountry(country.toObject()); 
         if (error) {
           refLoadDebugger("New Country Validate Error", country.code, error.message);
           return
         }
        
         country.save((err, country) => {
           if (err) return console.error(`New Country Save Error: ${err}`);
           refLoadDebugger(country.name + " add saved to country collection.");
      });
      } else {       
         // Existing Country here ... update
         let id = docs.id;

         const country = Country.findByIdAndUpdate({ _id: docs.id },
           { name: cName,
             activeFlag: cLoadFlg,
             code: cCode,
             zone: {
              _id: zoneId,
              zoneName: zoneName} 
           }, 
           { new: true }
         );
   
         if (country != null) {
           const { error } = country.validateCountry(country.toObject()); 
           if (error) {
             refLoadDebugger("Country Update Validate Error", cCode, cName, cLoadFlg, error.message);
             return
           }

           country.save((err, country) => {
             if (err) return console.error(`Country Update Save Error: ${err}`);
                refLoadDebugger(country.name + " update saved to country collection.");
              });

         } else {
            refLoadDebugger("Country Update, ID Not Found ", cCode, cName, cLoadFlg);
            return;
        }
      }
    
  
  } catch (err) {
      refLoadDebugger('Error:', err.message);
      return;
  }
}

 module.exports = runLoad;