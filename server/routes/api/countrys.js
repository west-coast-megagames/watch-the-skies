const {Country, validateCountry} = require('../../models/country'); 
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', async (req, res) => {
    const countrys = await C.find().sort('-dateOut');
    res.send(rentals);
  });