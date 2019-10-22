const fs = require('fs')
const file = fs.readFileSync('./util/init-json/refdata.json', 'utf8');
const refDataIn = JSON.parse(file);

const express = require('express');
const bodyParser = require('body-parser');

// Country Model - Using Mongoose Model
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
    if (refDataIn[i].type == "country") {
      loadCountry(refDataIn[i].name, refDataIn[i].code, refDataIn[i].activeFlag);
    }
  };
};

function loadCountry(cName, cCode, cActiveFlg){
  console.log("In loadCountry", cCode,cName,cActiveFlg);
  
  let country = new Country({ 
    code: cCode,
    name: cName,
    activeFlag: cActiveFlg
    });
  
  /*
  const { error } = country.validateCountry(country); 
  if (error) {
    console.log("Validate Error", country.code, country.name, country.activeFlag, error.message);
    return
  }
  */
  console.log("before save", country.code, country.name, country.activeFlag);
  country.save((err, country) => {
    if (err) return console.error(`Save Error: ${err}`);
    console.log(country.name + " saved to country collection.");
  });
}

 module.exports = initLoad;