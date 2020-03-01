const fs = require('fs')
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initSquad.json', 'utf8');
const squadDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const squadLoadDebugger = require('debug')('app:squadLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Squad Model - Using Mongoose Model
const { Squad, validateSquad } = require('../../models/ops/squad');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team/team');
const { Gear } = require('../../models/gov/equipment/gear');
const { loadMilGears, gears } = require('../../wts/construction/equipment/milGear');
const { Site } = require('../../models/sites/site');
const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runSquadLoad(runFlag){
  try {  
    //squadLoadDebugger("Jeff in runSquadLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      await loadMilGears();                         // load wts/json/milGear.json data into array    
      
      await deleteAllSquads(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    squadLoadDebugger('Catch runSquadLoad Error:', err.message);
    logger.error('Catch runSquadLoad Error:', err.message);
    return false; 
  }
};

async function initLoad(doLoad) {
  
  //squadLoadDebugger("Jeff in initLoad", doLoad, squadDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < squadDataIn.length; ++i ) {
    
    //logger.info("Jeff in runSquadLoad loop %O", i, squadDataIn[i].name );    
    //logger.info("Jeff in runSquadLoad loop %O", i, squadDataIn[i] );
    
    await loadSquad(squadDataIn[i]);
  }
};

async function loadSquad(iData){
  try {   
    let squad = await Squad.findOne( { name: iData.name } );
    if (!squad) {
      // New Squad/Squad here
      let squad = new Squad({ 
        name: iData.name,
        type: iData.type
      }); 

      if (iData.team != ""){
        let team = await Team.findOne({ teamCode: iData.team });  
        if (!team) {
          squadLoadDebugger("Squad Load Team Error, New Squad:", iData.name, " Team: ", iData.team);
        } else {
          squad.team = team._id;
          squadLoadDebugger("Squad Load Team Found, Squad:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
        }
      }      

      if (iData.country != ""){
        let country = await Country.findOne({ code: iData.country });  
        if (!country) {
          squadLoadDebugger("Squad Load Country Error, New Squad:", iData.name, " Country: ", iData.country);
        } else {
          squad.country = country._id;
          squad.zone    = country.zone;
          squadLoadDebugger("Squad Load Country Found, Squad:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
        }
      }       

      if (iData.homeBase != ""){
        let site = await Site.findOne({ siteCode: iData.homeBase });  
        if (!site) {
          squadLoadDebugger("Squad Load Home Base Error, New Squad:", iData.name, " homeBase: ", iData.homeBase);
        } else {
          squad.homeBase = site._id;
          squadLoadDebugger("Squad Load Home Base Found, Squad:", iData.name, " homeBase: ", iData.homeBase, "Site ID:", site._id);
        }
      }

      // create gears records for squad and store ID in squad.system
      //console.log("jeff squad gears  iData.gear", iData.gear);
      squad.equipment = [];
      for (let ger of iData.gear) {
        let gerRef = gears[gears.findIndex(gear => gear.name === ger )];
        //console.log("jeff in squad gears ", sys, "gerRef:", gerRef);
        if (gerRef) {
          newGear = await new Gear(gerRef);
          newGear.team         = squad.team;
          newGear.manufacturer = squad.team;  
          newGear.status.building = false;
          await newGear.save(((err, newGear) => {
          if (err) {
            logger.error(`New Squad Gear Save Error: ${err}`);
            return console.error(`New Squad Gear Save Error: ${err}`);
          }
          squadLoadDebugger(squad.name, "Gear", ger, " add saved to Equipment collection.");
          }));

          squad.gear.push(newGear._id)
        } else {
          logger.error('Error in creation of gear', ger, "for ", squad.name);
        }
      }

      let { error } = validateSquad(squad); 
      if (error) {
        logger.error("New Squad Validate Error", squad.name, error.message);
        // remove associated gears records
        for (let j = 0; j < squad.gear.length; ++j ) {
          gerId = squad.equipment[j];
          let gearDel = await Gear.findByIdAndRemove(gerId);
          if (gearDel = null) {
             logger.error(`The Squad Gear with the ID ${gerId} was not found!`);
          }
          logger.info(`The Squad Gear with the ID ${gerId} was DELETED ... Squad validate error!`);
        }
      }

      await squad.save((err, squad) => {
        if (err) return console.error(`New Squad Save Error: ${err}`);
        squadLoadDebugger(squad.name + " add saved to squad collection.");
        logger.info(squad.name + " add saved to squad collection.");
        //updateStats(squad._id);
      });
    } else {
      let id = squad._id;
  
      if (iData.team != ""){
        let team = await Team.findOne({ teamCode: iData.team });  
        if (!team) {
          squadLoadDebugger("Squad Load Team Error, Update Squad:", iData.name, " Team: ", iData.team);
        } else {
          squad.team = team._id;
          squadLoadDebugger("Squad Load Team Found, Squad:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
        }
      }      

      if (iData.country != ""){
        let country = await Country.findOne({ code: iData.country });  
        if (!country) {
          squadLoadDebugger("Squad Load Country Error, Update Squad:", iData.name, " Country: ", iData.country);
        } else {
          squad.country = country._id;
          squad.zone    = country.zone;
          squadLoadDebugger("Squad Load Country Found, Squad:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
        }
      }       

      if (iData.homeBase != ""){
        let site = await Site.findOne({ siteCode: iData.homeBase });  
        if (!site) {
          squadLoadDebugger("Squad Load Home Base Error, Update Squad:", iData.name, " homeBase: ", iData.homeBase);
        } else {
          squad.homeBase = site._id;
          squadLoadDebugger("Squad Load Home Base Found, Squad:", iData.name, " homeBase: ", iData.homeBase, "Site ID:", site._id);
        }
      }         

      // create gears records for squad and store ID in squad.system
      //console.log("jeff squad gears  iData.gear", iData.gear);
      squad.equipment = [];
      for (let ger of iData.gear) {
        let gerRef = gears[gears.findIndex(gear => gear.name === ger )];
        //console.log("jeff in squad gears ", sys, "gerRef:", gerRef);
        if (gerRef) {
          newGear = await new Gear(gerRef);
          newGear.team         = squad.team;
          newGear.manufacturer = squad.team;  
          newGear.status.building = false;
          await newGear.save(((err, newGear) => {
            if (err) {
              logger.error(`New Squad Gear Save Error: ${err}`);
              return console.error(`New Squad Gear Save Error: ${err}`);
            }
            squadLoadDebugger(squad.name, "Gear", ger, " add saved to Equipment collection.");
          }));

          squad.gear.push(newGear._id)
        } else {
          squadLoadDebugger('Error in creation of gear', ger, "for ", squad.name);
        }
      }

      let { error } = validateSquad(squad); 
      if (error) {
        squadLoadDebugger("Update Squad Validate Error", squad.name, error.message);
        // remove associated gears records
        for (let j = 0; j < squad.gear.length; ++j ) {
          gerId = squad.equipment[j];
          let gearDel = await Gear.findByIdAndRemove(gerId);
          if (gearDel = null) {
             console.log(`The Squad Gear with the ID ${gerId} was not found!`);
          }
          console.log(`The Squad Gear with the ID ${gerId} was DELETED ... Squad validate error!`);
        }      
        return; 
      }

      await squad.save((err, squad) => {
        if (err) return console.error(`Update Squad Save Error: ${err}`);
        squadLoadDebugger(squad.name + " add saved to squad collection.");
        //updateStats(squad._id);
      });
    }
  } catch (err) {
    logger.error('Catch Squad Error:', err.message);
    return;
  }
};

async function deleteAllSquads(doLoad) {
  
  if (!doLoad) return;

  try {
    for await (const squad of Squad.find()) {    
      let id = squad._id;

      //squadLoadDebugger("Jeff in deleteAllSquads loop", squad.name); 
      try {

        // remove associated gears records
        for (let j = 0; j < squad.gear.length; ++j ) {
          gerId = squad.gear[j];
          let gearDel = await Gear.findByIdAndRemove(gerId);
          if (gearDel = null) {
            squadLoadDebugger(`The Squad Gear with the ID ${gerId} was not found!`);
          }
        }

        let squadDel = await Squad.findByIdAndRemove(id);
        if (squadDel = null) {
          logger.error(`The Squad with the ID ${id} was not found!`);
        }
        //squadLoadDebugger("Jeff in deleteAllSquads loop after remove", squad.name); 
      } catch (err) {
        logger.error('Squad Delete All Error:', err.message);
      }
    }        
    logger.info("All Squads succesfully deleted!");
  } catch (err) {
    logger.error(`Delete All Squads Catch Error: ${err.message}`);
  }
};

module.exports = runSquadLoad;