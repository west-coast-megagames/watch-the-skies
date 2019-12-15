const fs = require('fs')
const file = fs.readFileSync('./init-json/initUser.json', 'utf8');
const userDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const userLoadDebugger = require('debug')('app:userLoad');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// User Model - Using Mongoose Model
const { User, validateUser } = require('../models/user');
const { Team, validateTeam } = require('../models/team');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runUserLoad(runFlag){
  try {  
    //userLoadDebugger("Jeff in runUserLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllUsers(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    userLoadDebugger('Catch runUserLoad Error:', err.message);
    return; 
  }
};

async function initLoad(doLoad) {
  
  //userLoadDebugger("Jeff in initLoad", doLoad, userDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < userDataIn.length; ++i ) {
    
    //userLoadDebugger("Jeff in runUserLoad loop", i, userDataIn[i].screenname );    
    //userLoadDebugger("Jeff in runUserLoad loop", i, userDataIn[i] );
    
    await loadUser(userDataIn[i]);
  }
};

async function loadUser(iData){
  try {   
    //userLoadDebugger("UserLoad ... Screenname", iData.screenname, "name", iData.name, "address", iData.address);
    let user = await User.findOne( { screenname: iData.screenname } );
    if (!user) {
       // New User here
       let convDate = new Date(iData.DoB);
       let user = new User({ 
           screenname: iData.screenname,
           email: iData.email,
           phone: iData.phone,
           gender: iData.gender,
           discord: iData.discord,
           password: iData.password,
           address: iData.address,
           DoB: convDate
        }); 
       
        user.name.first = iData.name.first;
        user.name.last  = iData.name.last;

        //userLoadDebugger("Before Save Validate ... New user.name", user.name.first, "address street1", user.address.street1, user.DoB);

        let { error } = validateUser(user); 
        if (error) {
          userLoadDebugger("New User Validate Error", user.screenname, error.message);
          return;
        }

        //userLoadDebugger("After Save Validate ... New user.name", user.name.first, "address street1", user.address.street1, user.DoB);
        
        if (iData.teamCode != ""){
          let team = await Team.findOne({ teamCode: iData.teamCode });  
          if (!team) {
            userLoadDebugger("User Load Team Error, New User:", iData.screenname, " Team: ", iData.teamCode);
          } else {
            user.team.team_id  = team._id;
            user.team.teamName = team.shortName;
            user.team.teamCode = team.teamCode;
            userLoadDebugger("User Load Team Found, User:", iData.screenname, " Team: ", iData.teamCode, "Team ID:", team._id);
          }
        }
        
        //userLoadDebugger("Before Save ... New user.name", user.name.first, "address street1", user.address.street1, user.DoB);

        await user.save((err, user) => {
          if (err) return console.error(`New User Save Error: ${err}`);
          userLoadDebugger(user.screenname + " saved to user collection.");
        });
    } else {       
      // Existing User here ... update
      let id = user._id;
      let convDate     = new Date(iData.DoB);
      user.screenname  = iData.screenname;
      user.name.first  = iData.name.first;
      user.name.last   = iData.name.last;
      user.phone       = iData.phone;
      user.email       = iData.email;
      user.address     = iData.address;
      user.gender      = iData.gender;
      user.discord     = iData.discord;
      user.password    = iData.password;
      user.DoB         = convDate;

      if (iData.teamCode != ""){
        let team = await Team.findOne({ teamCode: iData.teamCode });  
        if (!team) {
          userLoadDebugger("User Load Team Error, Update User:", iData.screenname, " Team: ", iData.teamCode);
        } else {
          user.team.team_id  = team._id;
          user.team.teamName = team.shortName;
          user.team.teamCode = team.teamCode;
          userLoadDebugger("User Load Update Team Found, User:", iData.screenname, " Team: ", iData.teamCode, "Team ID:", team._id);
        }
      }
      
      userLoadDebugger("Update user.name", user.name, "address", user.address, user.DoB);

      const { error } = validateUser(user); 
      if (error) {
        userLoadDebugger("User Update Validate Error", iData.screenname, error.message);
        return
      }
   
      await user.save((err, user) => {
      if (err) return console.error(`User Update Save Error: ${err}`);
      userLoadDebugger(user.screenname + " update saved to user collection.");
      });
    }
  } catch (err) {
    userLoadDebugger('Catch User Error:', err.message);
    return;
}

};

async function deleteAllUsers(doLoad) {
  
  userLoadDebugger("Jeff in deleteAllUsers", doLoad);    
  if (!doLoad) return;

  try {
    for await (const user of User.find()) {    
      let id = user._id;
      try {
        let userDel = await User.findByIdAndRemove(id);
        if (userDel = null) {
          userLoadDebugger(`The Zone with the ID ${id} was not found!`);
        }
      } catch (err) {
        userLoadDebugger('User Delete All Error:', err.message);
      }
    }        
    userLoadDebugger("All Users succesfully deleted!");
  } catch (err) {
    userLoadDebugger(`Delete All Users Catch Error: ${err.message}`);
  }
};  

module.exports = runUserLoad;