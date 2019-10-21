const fs = require('fs')
const file = fs.readFileSync('./util/init-json/refdata.json', 'utf8');
const refDataIn = JSON.parse(file);

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const {Country, validateCountry} = require('./models/country'); 

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

var i; 
for (i = 0; i < refDataIn.length; ++i ) {

  if (refDataIn[i].type == "country") {

     loadCountry(refDataIn[i].name, refDataIn[i].code, refDataIn[i].activeFlag);
     
  }
};




function loadCountry( cName, cCode, cActiveFlg){
  console.log("In loadCountry", cCode,cName,cActiveFlg);
  
  /*
  const { error } = validateCountry(country.toObject()); 
  if (error) {
    console.log("Error Creating Country:",cCode,cName, error.details[0].message);
    return
  }
  */
 let country = new Country({ 
  code: cCode,
  name: cName,
  activeFlag: cActiveFlg
  });
  console.log("before save", country.code, country.name, country.activeFlag);
  
  country.save(function (err, country) {
    if (err) return console.error(err);
    console.log(country.name + " saved to country collection.");
  });
  
  /*
  if (error) {
    console.log("Error Creating Country:",cCode,cName, error.name,error.details[0].message);
  }
  */
 
}