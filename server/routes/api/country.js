const express = require('express');
const router = express.Router();

// Country Model - Using Mongoose Model
const Country = require('../../models/country'); 

router.get('/', async (req, res) => {
    const countrys = await Country.find().sort('code: 1');
    res.send(countrys);
  });

router.post('/', async (req, res) => {
  
  let country = new Country({ 
    code: req.body.code,
    name: req.body.name,
    activeFlag: req.body.activeFlag
  });

  const { error } = country.validateCountry(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  country = await country.save();
  
  res.send(country);
});

module.exports = router;