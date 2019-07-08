const fs = require('fs')
const file = fs.readFileSync('./init-json/refdata.json', 'utf8');
const refDataIn = JSON.parse(file);

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');

const app = express();


// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var i; 
for (i = 0; i < refDataIn.length; ++i ) {

  if (refDataIn[i].type == "country") {
     console.log(refDataIn[i].name, refDataIn[i].code, refDataIn[i].activeFlag);
  }
};

