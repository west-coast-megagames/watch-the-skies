const {Country, validateCountry} = require('../../models/country'); 
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', async (req, res) => {
    const countrys = await Country.find().sort('code: 1');
    res.send(countrys);
  });

  router.post('/', async (req, res) => {
    /*
    const { error } = validateCountry(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
    */
  
    let country = new Country({ 
      code: req.body.code,
      name: req.body.name,
      activeFlag: req.body.activeFlag
    });
    country = await country.save();
    
    res.send(country);
  });