const fs = require('fs')
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initMilitary.json', 'utf8');
const militaryDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const militaryLoadDebugger = require('debug')('app:militaryLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Military Model - Using Mongoose Model
const { Military, validateMilitary, updateStats } = require('../../models/ops/military/military');
const { Fleet } = require('../../models/ops/military/fleet');
const { Corps } = require('../../models/ops/military/corps');
const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team/team');
const { Gear } = require('../../models/gov/equipment/gear');
const { loadMilGears, gears } = require('../../wts/construction/equipment/milGear');
const { BaseSite } = require('../../models/sites/baseSite');
const { Site } = require('../../models/sites/site');
const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runMilitaryLoad(runFlag){
  try {  
    //militaryLoadDebugger("Jeff in runMilitaryLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      await loadMilGears();                         // load wts/json/milGear.json data into array    
      
      await deleteAllMilitarys(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    militaryLoadDebugger('Catch runMilitaryLoad Error:', err.message);
    logger.error('Catch runMilitaryLoad Error:', err.message);
    return false; 
  }
};

async function initLoad(doLoad) {
  
  //militaryLoadDebugger("Jeff in initLoad", doLoad, militaryDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < militaryDataIn.length; ++i ) {
    
    //logger.info("Jeff in runMilitaryLoad loop %O", i, militaryDataIn[i].name );    
    //logger.info("Jeff in runMilitaryLoad loop %O", i, militaryDataIn[i] );
    
    await loadMilitary(militaryDataIn[i]);
  }
};

async function loadMilitary(iData){
  try {   
    let military = await Military.findOne( { name: iData.name } );
    if (!military) {
      //logger.info("Jeff 0a in loadMilitary %O", iData.name, iData.type);       
      switch(iData.type){
        case 'Fleet':
          createFleet(iData);
          break;

        case 'Corps':
          createCorps(iData);
          break;

        default:
          logger.error("Invalid Military Load Type:", iData.type, "name: ", iData.name );
      }
    } else {       
      // Existing Military here ... update
      //logger.info("Jeff 0b in loadMilitary %O", iData.name, iData.type); 
      switch(iData.type){
        case 'Fleet':
          updateFleet(iData);
          break;

        case 'Corps':
          updateCorps(iData);
          break;

        default:
          logger.error("Invalid Military Load Type:", iData.type, "name: ", iData.name);
      }
    }
  } catch (err) {
    logger.error('Catch Military Error:', err.message);
    return;
  }
};

async function deleteAllMilitarys(doLoad) {
  
  //militaryLoadDebugger("Jeff in deleteAllMilitarys", doLoad);    
  if (!doLoad) return;

  try {
    for await (const military of Military.find()) {    
      let id = military._id;

      //militaryLoadDebugger("Jeff in deleteAllMilitarys loop", military.name); 
      try {

        // remove associated gears records
        for (let j = 0; j < military.gear.length; ++j ) {
          gerId = military.gear[j];
          let gearDel = await Gear.findByIdAndRemove(gerId);
          if (gearDel = null) {
            militaryLoadDebugger(`The Military Gear with the ID ${gerId} was not found!`);
          }
        }

        let militaryDel = await Military.findByIdAndRemove(id);
        if (militaryDel = null) {
          logger.error(`The Military with the ID ${id} was not found!`);
        }
        //militaryLoadDebugger("Jeff in deleteAllMilitarys loop after remove", military.name); 
      } catch (err) {
        logger.error('Military Delete All Error:', err.message);
      }
    }        
    logger.info("All Militarys succesfully deleted!");
  } catch (err) {
    logger.error(`Delete All Militarys Catch Error: ${err.message}`);
  }
};  

async function createFleet(iData){
  //logger.info("Jeff 1 in loadMilitary %O", iData.name, iData.type); 
  // New Fleet/Military here
  let fleet = new Fleet({ 
    name: iData.name,
    type: iData.type,
    code: iData.code
  }); 

  //fleet.stats  = iData.stats;
  //fleet.status = iData.status;

  if (iData.team != ""){
    let team = await Team.findOne({ teamCode: iData.team });  
   if (!team) {
     militaryLoadDebugger("Military Load Team Error, New Military:", iData.name, " Team: ", iData.team);
   } else {
     fleet.team = team._id;
     militaryLoadDebugger("Military Load Team Found, Military:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
   }
  }      

  if (iData.country != ""){
    let country = await Country.findOne({ code: iData.country });  
    if (!country) {
      militaryLoadDebugger("Military Load Country Error, New Military:", iData.name, " Country: ", iData.country);
    } else {
      fleet.country = country._id;
      fleet.zone    = country.zone;
      militaryLoadDebugger("Military Load Country Found, Military:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
    }
  }       

  if (iData.homeBase != ""){
    let site = await Site.findOne({ siteCode: iData.homeBase });  
    if (!site) {
      militaryLoadDebugger("Military Load Home Base Error, New Military:", iData.name, " homeBase: ", iData.homeBase);
    } else {
      fleet.homeBase = site._id;
      militaryLoadDebugger("Military Load Home Base Found, Military:", iData.name, " homeBase: ", iData.homeBase, "Site ID:", site._id);
    }
  }       

  // create gears records for military and store ID in military.system
  //console.log("jeff military gears  iData.gear", iData.gear);
  fleet.equipment = [];
  for (let ger of iData.gear) {
    let gerRef = gears[gears.findIndex(gear => gear.name === ger )];
    //console.log("jeff in military gears ", sys, "gerRef:", gerRef);
    if (gerRef) {
      newGear = await new Gear(gerRef);
      newGear.team         = fleet.team;
      newGear.manufacturer = fleet.team; 
      newGear.status.building = false; 
      await newGear.save(((err, newGear) => {
      if (err) {
        logger.error(`New Military Gear Save Error: ${err}`);
        return console.error(`New Military Gear Save Error: ${err}`);
      }
      militaryLoadDebugger(fleet.name, "Gear", ger, " add saved to Equipment collection.");
      }));

      fleet.gear.push(newGear._id)
    } else {
      logger.error('Error in creation of gear', ger, "for ", fleet.name);
    }
  }

  let { error } = validateMilitary(fleet); 
  if (error) {
    logger.error("New Military Validate Error", fleet.name, error.message);
    // remove associated gears records
    for (let j = 0; j < fleet.gear.length; ++j ) {
      gerId = military.equipment[j];
      let gearDel = await Gear.findByIdAndRemove(gerId);
      if (gearDel = null) {
         logger.error(`The Military Gear with the ID ${gerId} was not found!`);
      }
      logger.info(`The Military Gear with the ID ${gerId} was DELETED ... Military validate error!`);
    }      
    return; 
  }

  await fleet.save((err, fleet) => {
    if (err) return console.error(`New Military Save Error: ${err}`);
    militaryLoadDebugger(fleet.name + " add saved to military collection.");
    logger.info(fleet.name + " add saved to military collection.");
    updateStats(fleet._id);
  });
}

async function createCorps(iData){
  // New Corps/Military here
  let corps = new Corps({ 
    name: iData.name,
    type: iData.type,
    code: iData.code
  }); 

  //corps.stats  = iData.stats;
  //corps.status = iData.status;

  if (iData.team != ""){
    let team = await Team.findOne({ teamCode: iData.team });  
   if (!team) {
     //logger.info("Military Load Team Error, New Military:", iData.name, " Team: ", iData.team);
   } else {
     corps.team = team._id;
     //logger.info("Military Load Team Found, Military:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
   }
  }      

  if (iData.country != ""){
    let country = await Country.findOne({ code: iData.country });  
    if (!country) {
      //logger.info("Military Load Country Error, New Military:", iData.name, " Country: ", iData.country);
    } else {
      corps.country = country._id;
      corps.zone    = country.zone;
      //logger.info("Military Load Country Found, Military:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
    }
  }       

  if (iData.homeBase != ""){
    let site = await Site.findOne({ siteCode: iData.homeBase });  
    if (!site) {
      //logger.info("Military Load Home Base Error, New Military:", iData.name, " homeBase: ", iData.homeBase);
    } else {
      corps.homeBase = site._id;
      //logger.info("Military Load Home Base Found, Military:", iData.name, " homeBase: ", iData.homeBase, "Site ID:", site._id);
    }
  }       

  // create gears records for military and store ID in military.system
  //console.log("jeff military gears  iData.gear", iData.gear);
  corps.equipment = [];
  for (let ger of iData.gear) {
    let gerRef = gears[gears.findIndex(gear => gear.name === ger )];
    //console.log("jeff in military gears ", sys, "gerRef:", gerRef);
    if (gerRef) {
      newGear = await new Gear(gerRef);
      newGear.team         = corps.team;
      newGear.manufacturer = corps.team;  
      newGear.status.building = false;
      await newGear.save(((err, newGear) => {
      if (err) {
        logger.error(`New Military Gear Save Error: ${err}`);
        return console.error(`New Military Gear Save Error: ${err}`);
      }
      //logger.info(corps.name, "Gear", ger, " add saved to Equipment collection.");
      }));

      corps.gear.push(newGear._id)
    } else {
      logger.error('Error in creation of gear', ger, "for ", corps.name);
    }
  }

  let { error } = validateMilitary(corps); 
  if (error) {
    logger.error("New Military Validate Error", corps.name, error.message);
    // remove associated gears records
    for (let j = 0; j < corps.gear.length; ++j ) {
      gerId = military.equipment[j];
      let gearDel = await Gear.findByIdAndRemove(gerId);
      if (gearDel = null) {
         logger.error(`The Military Gear with the ID ${gerId} was not found!`);
      }
      logger.info(`The Military Gear with the ID ${gerId} was DELETED ... Military validate error!`);
    }      
    return; 
  }

  await corps.save((err, corps) => {
    if (err) return console.error(`New Military Save Error: ${err}`);
    militaryLoadDebugger(corps.name + " add saved to military collection.");
    logger.info(corps.name + " add saved to military collection.");
    updateStats(corps._id);
  });
}

async function updateFleet(iData){
  // Update Fleet/Military here
  let fleet = await Fleet.findOne( { name: iData.name } );
  if (!fleet) {
    return
  }

  let id = fleet._id;
  //fleet.name  = iData.name;
  //fleet.stats  = iData.stats;
  //fleet.status = iData.status;

  if (iData.team != ""){
    let team = await Team.findOne({ teamCode: iData.team });  
   if (!team) {
     militaryLoadDebugger("Military Load Team Error, Update Military:", iData.name, " Team: ", iData.team);
   } else {
     fleet.team = team._id;
     militaryLoadDebugger("Military Load Team Found, Military:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
   }
  }      

  if (iData.country != ""){
    let country = await Country.findOne({ code: iData.country });  
    if (!country) {
      militaryLoadDebugger("Military Load Country Error, Update Military:", iData.name, " Country: ", iData.country);
    } else {
      fleet.country = country._id;
      fleet.zone    = country.zone;
      militaryLoadDebugger("Military Load Country Found, Military:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
    }
  }       

  if (iData.homeBase != ""){
    let site = await Site.findOne({ siteCode: iData.homeBase });  
    if (!site) {
      militaryLoadDebugger("Military Load Home Base Error, Update Military:", iData.name, " homeBase: ", iData.homeBase);
    } else {
      fleet.homeBase = site._id;
      militaryLoadDebugger("Military Load Home Base Found, Military:", iData.name, " homeBase: ", iData.homeBase, "Site ID:", site._id);
    }
  }       

  // create gears records for military and store ID in military.system
  //console.log("jeff military gears  iData.gear", iData.gear);
  fleet.equipment = [];
  for (let ger of iData.gear) {
    let gerRef = gears[gears.findIndex(gear => gear.name === ger )];
    //console.log("jeff in military gears ", sys, "gerRef:", gerRef);
    if (gerRef) {
      newGear = await new Gear(gerRef);
      newGear.team         = fleet.team;
      newGear.manufacturer = fleet.team;  
      newGear.status.building = false;
      await newGear.save(((err, newGear) => {
      if (err) {
        logger.error(`New Military Gear Save Error: ${err}`);
        return console.error(`New Military Gear Save Error: ${err}`);
      }
      militaryLoadDebugger(fleet.name, "Gear", ger, " add saved to Equipment collection.");
      }));

      fleet.gear.push(newGear._id)
    } else {
      militaryLoadDebugger('Error in creation of gear', ger, "for ", fleet.name);
    }
  }

  let { error } = validateMilitary(fleet); 
  if (error) {
    militaryLoadDebugger("Update Military Validate Error", fleet.name, error.message);
    // remove associated gears records
    for (let j = 0; j < fleet.gear.length; ++j ) {
      gerId = military.equipment[j];
      let gearDel = await Gear.findByIdAndRemove(gerId);
      if (gearDel = null) {
         console.log(`The Military Gear with the ID ${gerId} was not found!`);
      }
      console.log(`The Military Gear with the ID ${gerId} was DELETED ... Military validate error!`);
    }      
    return; 
  }

  await fleet.save((err, fleet) => {
    if (err) return console.error(`Update Military Save Error: ${err}`);
    militaryLoadDebugger(fleet.name + " add saved to military collection.");
    updateStats(fleet._id);
  });
}

async function updateCorps(iData){
  // Update Corps/Military here
  let corps = await Corps.findOne( { name: iData.name } );
  if (!corps) {
    return
  }

  let id = corps._id;
  //corps.name  = iData.name;
  //corps.stats  = iData.stats;
  //corps.status = iData.status;

  if (iData.team != ""){
    let team = await Team.findOne({ teamCode: iData.team });  
   if (!team) {
     militaryLoadDebugger("Military Load Team Error, Update Military:", iData.name, " Team: ", iData.team);
   } else {
     corps.team = team._id;
     militaryLoadDebugger("Military Load Team Found, Military:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
   }
  }      

  if (iData.country != ""){
    let country = await Country.findOne({ code: iData.country });  
    if (!country) {
      militaryLoadDebugger("Military Load Country Error, Update Military:", iData.name, " Country: ", iData.country);
    } else {
      corps.country = country._id;
      corps.zone    = country.zone;
      militaryLoadDebugger("Military Load Country Found, Military:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
    }
  }       

  if (iData.homeBase != ""){
    let site = await Site.findOne({ code: iData.homeBase });  
    if (!site) {
      militaryLoadDebugger("Military Load Home Base Error, Update Military:", iData.name, " homeBase: ", iData.homeBase);
    } else {
      corps.homeBase = site._id;
      militaryLoadDebugger("Military Load Home Base Found, Military:", iData.name, " homeBase: ", iData.homeBase, "Site ID:", site._id);
    }
  }       

  // create gears records for military and store ID in military.system
  //console.log("jeff military gears  iData.gear", iData.gear);
  corps.equipment = [];
  for (let ger of iData.gear) {
    let gerRef = gears[gears.findIndex(gear => gear.name === ger )];
    //console.log("jeff in military gears ", sys, "gerRef:", gerRef);
    if (gerRef) {
      newGear = await new Gear(gerRef);
      newGear.team         = corps.team;
      newGear.manufacturer = corps.team; 
      newGear.status.building = false; 
      await newGear.save(((err, newGear) => {
      if (err) {
        logger.error(`New Military Gear Save Error: ${err}`);
        return console.error(`New Military Gear Save Error: ${err}`);
      }
      militaryLoadDebugger(corps.name, "Gear", ger, " add saved to Equipment collection.");
      }));

      corps.gear.push(newGear._id)
    } else {
      militaryLoadDebugger('Error in creation of gear', ger, "for ", corps.name);
    }
  }

  let { error } = validateMilitary(corps); 
  if (error) {
    militaryLoadDebugger("Update Military Validate Error", corps.name, error.message);
    // remove associated gears records
    for (let j = 0; j < corps.gear.length; ++j ) {
      gerId = military.equipment[j];
      let gearDel = await Gear.findByIdAndRemove(gerId);
      if (gearDel = null) {
         console.log(`The Military Gear with the ID ${gerId} was not found!`);
      }
      console.log(`The Military Gear with the ID ${gerId} was DELETED ... Military validate error!`);
    }      
    return; 
  }

  await corps.save((err, corps) => {
    if (err) return console.error(`Update Military Save Error: ${err}`);
    militaryLoadDebugger(corps.name + " add saved to military collection.");
    updateStats(corps._id);
  });
}

module.exports = runMilitaryLoad;