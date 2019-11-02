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
const Country = require('./models/country'); 

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// logging utility for demos below
const logger = (err, result) =>
{ if (err)
    console.log ('error:', err.message, error.name, err.stack)
}

function initLoad() {
  for (let i = 0; i < refDataIn.length; ++i ) {
    
    if (refDataIn[i].type == "zone") {
console.log("jeff calling loadZone", refDataIn[i].name, refDataIn[i].code, refDataIn[i].activeFlag);      
      loadZone(refDataIn[i].name, refDataIn[i].code, refDataIn[i].activeFlag);
    }

    if (refDataIn[i].type == "country") {
      // loadCountry(refDataIn[i].name, refDataIn[i].code, refDataIn[i].activeFlag);
      console.log("Country load commented out", refDataIn[i].code);
    }
  };
};

function loadZone(zName, zCode, zActiveFlg){
  try {
console.log("jeff in zone load ... zCode", zCode, zName, zActiveFlg);    
    let docs = Zone.find( { zoneCode: zCode } );
    if (!docs.length) {
       // New Zone here
       let zone = new Zone({ 
           zoneCode: zCode,
           zoneName: zName,
           zoneActive: zActiveFlg
        }); 
      
console.log("jeff before zone validate ... zone ", zone.zoneCode, zone.zoneName, zone.zoneActive); 
        let { error } = zone.validateZone(zone.toObject()); 
        if (error) {
          console.log("New Zone Validate Error", zone.zoneCode, error.message);
          return
        }
        
        zone.save((err, zone) => {
          if (err) return console.error(`New Zone Save Error: ${err}`);
          console.log(zone.zoneName + " add saved to zones collection.");
        });
    } else {       
       // Existing Zone here ... update
       let id = docs.id;

       const zone = Zone.findByIdAndUpdate({ _id: docs.id },
         { zoneName: zName,
           zoneActive: zActiveFlg,
           zoneCode: zCode }, 
         { new: true }
       );
   
       if (zone != null) {
         const { error } = zone.validateZone(zone.toObject()); 
         if (error) {
           console.log("Zone Update Validate Error", zCode, zName, zActiveFlg, error.message);
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
    return
}

};

function loadCountry(cName, cCode, cActiveFlg){
  
  try {
    let docs = Country.find({ Code: cCode });
console.log("jeff in country load ... docs.length", docs.length, cCode);        
    if (!docs.length) {
      // New Country here

      let country = new Country({ 
        code: cCode,
        name: cName,
        activeFlag: cActiveFlg
      });
  
      const { error } = country.validateCountry(country.toObject()); 
      if (error) {
        console.log("Validate Error", country.code, country.name, country.activeFlag, error.message);
        return
      }

      country.save((err, country) => {
        if (err) return console.error(`Save Error: ${err}`);
        console.log(country.name + " saved to country collection.");
      });
    } else {       
      // Existing Zone here ... update
    }
  } catch (err) {
    console.log('Error:', err.message);
    return
  }    
};

 module.exports = initLoad;

 //initLoad();