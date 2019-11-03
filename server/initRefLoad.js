const fs = require('fs')
const file = fs.readFileSync('./util/init-json/refdata.json', 'utf8');
const refDataIn = JSON.parse(file);
//const mongoose = require('mongoose');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Country Model - Using Mongoose Model
const { Zone } = require('./models/zone');
const { Country } = require('./models/country'); 

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function runLoad(runFlag){
  if(runFlag) initLoad();
};

// logging utility for demos below
const logger = (err, result) =>
{ if (err)
    console.log ('error:', err.message, error.name, err.stack)
}

function initLoad() {
  for (let i = 0; i < refDataIn.length; ++i ) {
    
    if (refDataIn[i].type == "zone") {     
      loadZone(refDataIn[i].name, refDataIn[i].code, refDataIn[i].activeFlag);
    }

    if (refDataIn[i].type == "country") {
      loadCountry(refDataIn[i].name, refDataIn[i].code, refDataIn[i].activeFlag, refDataIn[i].refOther);
    }
  };
};

async function loadZone(zName, zCode, zActiveFlg){
  try {   
    let docs = await Zone.find( { zoneCode: zCode } );
console.log("jeff in loadzone ... docs.length", docs.length, zCode);    
    if (!docs.length) {
       // New Zone here
       let zone = new Zone({ 
           zoneCode: zCode,
           zoneName: zName,
           zoneActive: zActiveFlg
        }); 
      
        let { error } = zone.validateZone(zone); 
        if (error) {
          console.log("New Zone Validate Error", zone.zoneCode, error.message);
          return;
        }
        
        zone.save((err, zone) => {
          if (err) return console.error(`New Zone Save Error: ${err}`);
          console.log(zone.zoneName + " add saved to zones collection.");
        });
    } else {       
       // Existing Zone here ... update
       let id = docs.id;

       let zone = Zone.findByIdAndUpdate({ _id: docs.id },
         { zoneName: zName,
           zoneActive: zActiveFlg,
           zoneCode: zCode }, 
         { new: true }
       );
   
       if (zone != null) {
         const { error } = zone.validateZone(zone); 
         if (error) {
           console.log("Zone Update Validate Error", zCode, zName, zActiveFlg, zone.zoneCode, error.message);
           return
         }

         zone.save((err, zone) => {
           if (err) return console.error(`Zone Update Save Error: ${err}`);
              console.log(zone.zoneName + " update saved to zones collection.");
            });

       } else {
          console.log("Zone Update, ID Not Found ", zCode, zName, zActiveFlg);
          return
      }
    }
  } catch (err) {
    console.log('Error:', err.message);
    return;
}

};

function loadCountry(cName, cCode, cActiveFlg, zCode){
  
  try {   

    let zone = Zone.find({ zoneCode: zCode });
console.log("jeff here in load country after zone find: ", zCode, zone.length);    
    if (zone.length) {
      let zoneId = zone.id;
      let zoneName = zone.zoneName;
    } else {
      console.log("Country Load Zone Error, Country:", cCode, " Zone: ", zCode);
    }
      
      let docs = Country.find( { code: cCode } );
      if (!docs.length) {
         // New Country here
         let country = new Country({ 
             code: cCode,
             name: cName,
             activeFlag: cActiveFlg,
             zone: {
                _id: zoneId,
                zoneName: zoneName
            }
          }); 
      
         let { error } = Country.validateCountry(country.toObject()); 
         if (error) {
           console.log("New Country Validate Error", country.code, error.message);
           return
         }
        
         country.save((err, country) => {
           if (err) return console.error(`New Country Save Error: ${err}`);
           console.log(country.name + " add saved to country collection.");
      });
      } else {       
         // Existing Country here ... update
         let id = docs.id;

         const country = Country.findByIdAndUpdate({ _id: docs.id },
           { name: cName,
             activeFlag: cActiveFlg,
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
             console.log("Country Update Validate Error", cCode, cName, cActiveFlg, error.message);
             return
           }

           country.save((err, country) => {
             if (err) return console.error(`Country Update Save Error: ${err}`);
                console.log(country.name + " update saved to country collection.");
              });

         } else {
            console.log("Country Update, ID Not Found ", cCode, cName, cActiveFlg);
            return;
        }
      }
    
  
  } catch (err) {
      console.log('Error:', err.message);
      return;
  }
}

 module.exports = runLoad;