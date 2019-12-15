const fs = require('fs')
const file = fs.readFileSync('./init-json/refdata.json', 'utf8');
const refDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const zoneInitDebugger = require('debug')('app:zoneInit');
const teamInitDebugger = require('debug')('app:teamInit');
const countryInitDebugger = require('debug')('app:countryInit');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Country Model - Using Mongoose Model
const { Zone, validateZone } = require('../models/zone');
const { Country, validateCountry } = require('../models/country'); 
const { Team, validateTeam } = require('../models/team');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runLoad(runFlag){
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
};

async function initLoad(doLoad) {
  
  if (!doLoad) return;

  for (let i = 0; i < refDataIn.length; ++i ) {
    
    if (refDataIn[i].loadType == "zone") {     
      
      //Delete now regardless of loadFlag
      await deleteZone(refDataIn[i].name, refDataIn[i].code, refDataIn[i].loadFlag);
      
      if (refDataIn[i].loadFlag === "true") {
        await loadZone(refDataIn[i].name, refDataIn[i].code, refDataIn[i].loadFlag);
      }
    }

    if (refDataIn[i].loadType == "team") {     
      // Delete now regardless of loadFlag
      await deleteTeam(refDataIn[i].name, refDataIn[i].code, refDataIn[i].loadFlag);
      
      if (refDataIn[i].loadFlag == "true") {
        await loadTeam(refDataIn[i].name, refDataIn[i].code, refDataIn[i].loadFlag);
      }
      
    }

    if (refDataIn[i].loadType == "country") {
      
      //Delete now regardless of loadFlag
      await deleteCountry(refDataIn[i].name, refDataIn[i].code, refDataIn[i].loadFlag);
      
      if (refDataIn[i].loadFlag === "true") {
        await loadCountry(refDataIn[i].name, refDataIn[i].code, refDataIn[i].loadFlag, refDataIn[i].parentCode1, refDataIn[i].parentCode2);
      }
    }
  };
  return;
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
          zoneInitDebugger("New Zone Validate Error", zone.zoneCode, error.message);
          return;
        }
        
        await zone.save((err, zone) => {
          if (err) return console.error(`New Zone Save Error: ${err}`);
          zoneInitDebugger(zone.zoneName + " add saved to zones collection.");
        });
    } else {       
       // Existing Zone here ... update
       let id = zone._id;
      
       zone.zoneName = zName;
       zone.zoneCode = zCode;

       const { error } = validateZone(zone); 
       if (error) {
         zoneInitDebugger("Zone Update Validate Error", zCode, zName, zLoadFlg, error.message);
         return
       }
   
       await zone.save((err, zone) => {
       if (err) return console.error(`Zone Update Save Error: ${err}`);
          zoneInitDebugger(zone.zoneName + " update saved to zones collection.");
       });
    }
  } catch (err) {
    zoneInitDebugger('Load Zone Catch Error:', err.message);
    return;
}

};

async function deleteZone(zName, zCode, zLoadFlg){

  try {
    let delErrorFlag = false;
    for await (let zone of Zone.find( { zoneCode: zCode } )) {    
      try {
        let delId = zone._id;
        let zoneDel = await Zone.findByIdAndRemove(delId);
        if (zoneDel = null) {
          zoneInitDebugger(`deleteZone: Zone with the ID ${delId} was not found!`);
          let delErrorFlag = true;
        }
      } catch (err) {
        zoneInitDebugger('deleteZone Error 1:', err.message);
        let delErrorFlag = true;
      }
    }        
    if (!delErrorFlag) {
       zoneInitDebugger("All Zones succesfully deleted for Code:", zCode);
    } else {
       zoneInitDebugger("Some Error In Zones delete for Code:", zCode);
    }
  } catch (err) {
    zoneInitDebugger(`deleteZone Error 2: ${err.message}`);
  }
};

async function loadTeam(tName, tCode, tLoadFlg){
  try {   
    let team = await Team.findOne( { teamCode: tCode } );
    if (!team) {
       // New Team here
       if (tLoadFlg === "false") return;   // don't load if not true
       let team = new Team({ 
           teamCode: tCode,
           name: tName,
           countryID: tName
        }); 

        let { error } = validateTeam(team); 
        if (error) {
          teamInitDebugger("New Team Validate Error", team.teamCode, error.message);
          return;
        }
        
        await team.save((err, team) => {
          if (err) return console.error(`New Team Save Error: ${err}`);
          teamInitDebugger(team.name + " add saved to teams collection.");
        });
    } else {       
       // Existing Team here ... update
       let id = team._id;
      
       team.name = tName;
       team.teamCode = tCode;
       team.countryID = tCode;

       const { error } = validateTeam(team); 
       if (error) {
         teamInitDebugger("Team Update Validate Error", tCode, tName, tLoadFlg, error.message);
         return
       }
   
       await team.save((err, team) => {
       if (err) return console.error(`Team Update Save Error: ${err}`);
       teamInitDebugger(team.name + " update saved to teams collection.");
       });
    }
  } catch (err) {
    teamInitDebugger('Catch Team Error:', err.message);
    return;
}

};

async function deleteTeam(tName, tCode, tLoadFlg){

  try {
    let delErrorFlag = false;
    for await (let team of Team.find( { teamCode: tCode } )) {    
      try {
        let delId = team._id;
        let teamDel = await Team.findByIdAndRemove(delId);
        if (teamDel = null) {
          teamInitDebugger(`deleteTeam: Team with the ID ${delId} was not found!`);
          let delErrorFlag = true;
        }
      } catch (err) {
        teamInitDebugger('deleteTeam Error 1:', err.message);
        let delErrorFlag = true;
      }
    }        
    if (!delErrorFlag) {
       teamInitDebugger("All Teams succesfully deleted for Code:", tCode);
    } else {
       teamInitDebugger("Some Error In Teams delete for Code:", tCode);
    }
  } catch (err) {
    teamInitDebugger(`deleteTeam Error 2: ${err.message}`);
  }
};

async function loadCountry(cName, cCode, cLoadFlg, zCode, tCode){
  
  try {   

    let country = await Country.findOne( { code: cCode } );
    if (!country) {
      // New Country here
      if (cLoadFlg === "false") return;   // don't load if flag is not true

      let country = new Country({ 
          code: cCode,
          name: cName
      }); 

      let zone = await Zone.findOne({ zoneCode: zCode });  
      if (!zone) {
        countryInitDebugger("Country Load Zone Error, New Country:", cCode, " Zone: ", zCode);
      } else {
        country.zone.zone_id  = zone._id;
        country.zone.zoneName = zone.zoneName;
        country.zone.zoneCode = zone.zoneCode;
        countryInitDebugger("Country Load Zone Found, Country:", cCode, " Zone: ", zCode, "Zone ID:",zone._id);
      }      
      
      if (tCode != ""){
        let team = await Team.findOne({ teamCode: tCode });  
        if (!team) {
          countryInitDebugger("Country Load Team Error, New Country:", cCode, " Team: ", tCode);
        } else {
          country.team.team_id  = team._id;
          country.team.teamName = team.shortName;
          country.team.teamCode = team.teamCode;
          countryInitDebugger("Country Load Team Found, Country:", cCode, " Team: ", tCode, "Team ID:", team._id);
        }
      }      

      let { error } = validateCountry(country); 
      if (error) {
        countryInitDebugger("New Country Validate Error", country.code, error.message);
        return
      }
        
      await country.save((err, country) => {
        if (err) return console.error(`New Country Save Error: ${err}`);
        countryInitDebugger(country.name + " add saved to country collection.");
      });
      } else {       
        // Existing Country here ... update
        let id = country._id;
          
        country.name = cName;
        country.code = cCode;

        let zone = await Zone.findOne({ zoneCode: zCode });  
        if (!zone) {
          countryInitDebugger("Country Load Zone Error, Update Country:", cCode, " Zone: ", zCode);
        } else {
          country.zone.zone_id  = zone._id;
          country.zone.zoneName = zone.zoneName;
          country.zone.zoneCode = zone.zoneCode;
          countryInitDebugger("Country Load Zone Found, Update Country:", cCode, " Zone: ", zCode, "Zone ID:",zone._id);
        }      

        if (tCode != ""){
          let team = await Team.findOne({ teamCode: tCode });  
          if (!team) {
            countryInitDebugger("Country Load Team Error, Update Country:", cCode, " Team: ", tCode);
          } else {
            country.team.team_id  = team._id;
            country.team.teamName = team.shortName;
            country.team.teamCode = team.teamCode;
            countryInitDebugger("Country Load Team Found, Update Country:", cCode, " Team: ", tCode, "Team ID:", team._id);
          }
        }    

        const { error } = validateCountry(country); 
        if (error) {
          countryInitDebugger("Country Update Validate Error", cCode, cName, cLoadFlg, error.message);
          return
        }

        await country.save((err, country) => {
        if (err) return console.error(`Country Update Save Error: ${err}`);
        countryInitDebugger(country.name + " update saved to country collection.");
      });
    }
  } catch (err) {
      countryInitDebugger('Error:', err.message);
      return;
  }
}

async function deleteCountry(cName, cCode, cLoadFlg){

  try {
    let delErrorFlag = false;
    for await (let country of Country.find( { code: cCode } )) {    
      try {
        let delId = country._id;
        let countryDel = await Country.findByIdAndRemove(delId);
        if (countryDel = null) {
          countryInitDebugger(`deleteCountry: Country with the ID ${delId} was not found!`);
          let delErrorFlag = true;
        }
      } catch (err) {
        countryInitDebugger('deleteCountry Error 1:', err.message);
        let delErrorFlag = true;
      }
    }        
    if (!delErrorFlag) {
       countryInitDebugger("All Country succesfully deleted for Code:", cCode);
    } else {
       countryInitDebugger("Some Error In Country delete for Code:", cCode);
    }
  } catch (err) {
    countryInitDebugger(`deleteCountry Error 2: ${err.message}`);
  }
};

 module.exports = runLoad;