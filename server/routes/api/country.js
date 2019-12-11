const express = require('express');
const router = express.Router();

// Country Model - Using Mongoose Model
const {Country, validateCountry} = require('../../models/country'); 
const {Zone} = require('../../models/zone'); 

// @route   GET api/countrys
// @Desc    Get all ACTIVE countrys
// @access  Public
// Only Active
router.get('/', async (req, res) => {
  try {
    let countrys = await Country.find({ activeFlag: true }).sort('code: 1');
    res.json(countrys);
  } catch (err) {
    console.log('Error:', err.message);
    res.status(400).send(err.message);
  } 
});

// @route   GET api/countrys
// @Desc    Get all countrys
// @access  Public
//does not have to be active here
router.get('/all', async (req, res) => {
  try {
    let countrys = await Country.find().sort({code: 1});
    res.json(countrys);
  } catch (err) {
    console.log('Error:', err.message);
    res.status(400).send(err.message);
  } 
});

// @route   GET api/countrys/id
// @Desc    Get countrys by id
// @access  Public
router.get('/id/:id', async (req, res) => {

    let id = req.params.id;
    try {
        const country = await Country.findById(id);
        if (country != null) {
          res.json(country);
        } else {
          res.status(404).send(`The Country with the ID ${id} was not found!`);
        }
    } catch (err) {
        console.log('Error:', err.message);
        res.status(400).send(err.message);
    }
});

// @route   GET api/countrys/code
// @Desc    Get countrys by Country Code
// @access  Public
router.get('/code/:code', async (req, res) => {
  let code = req.params.code;
  try {
    let country = await Country.find({ code });
    if (country.length) {
      res.json(country);
    } else {
      res.status(404).send(`The Country with the code ${code} was not found!`);
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.status(400).send(`Error: ${err.message}`);
  }
});

// @route   POST api/countrys
// @Desc    Create New Country
// @access  Public
router.post('/', async (req, res) => {
  
  let { code, name, activeFlag, zoneCode } = req.body;

  try {
    for await (const zone of Zone.find({ zoneCode })) {
      let zoneID   = zone.id;
      let zoneName = zone.zoneName;

      const newCountry = new Country(
        { code, name, activeFlag,
          zone: {
            _id: zoneID,
            zoneName: zoneName
          }
        });
      try {
        let docs = await Country.find({ code })
        if (!docs.length) {
            let { error } = validateCountry(req.body); 
            if (error) return res.status(400).send(error.details[0].message);
  
            let country = await newCountry.save();
            res.json(country);
            console.log(`New Country ${req.body.code} created...`);
        } else {                
            console.log(`Country Code already exists: ${code}`);
            res.status(400).send(`Country Code ${code} already exists!`);
        }
      } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
      }
      break;   // only do 1 iteration
    }
  } catch (err) {
    return res.status(400).send(`The Country with the code ${Code} was not found!`);
  }
});

// @route   PUT api/country/id
// @Desc    Update Existing Country
// @access  Public  
router.put('/:id', async (req, res) => {
  let id = req.params.id;
  try {
      const country = await Country.findByIdAndUpdate({ _id: req.params.id },
        { name: req.body.name,
          activeflag: req.body.activeflag,
          code: req.body.code }, 
        { new: true }
        );

      if (country != null) {
        const { error } = country.validateCountry(req.body); 
        if (error) return res.status(400).send(error.details[0].message);
        res.json(country);
      } else {
        res.status(404).send(`The Country with the ID ${id} was not found!`);
      }
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.status(400).send(`Error: ${err.message}`);
  }
});

// @route   DELETE api/country/id
// @Desc    Update Existing Country
// @access  Public   
router.delete('/:id', async (req, res) => {

  let id = req.params.id;
  try {
      const country = await Country.findByIdAndRemove(req.params.id);

      if (country != null) {
        res.json(country);
      } else {
        res.status(404).send(`The Country with the ID ${id} was not found!`);
      } 
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.status(400).send(`Error: ${err.message}`);
  }        
});

// @route   PATCH api/country/deleteAll
// @desc    Delete All Countrys
// @access  Public
router.patch('/deleteAll', async function (req, res) {
  try {
      for await (const country of Country.find()) {    
        let id = country.id;  
        try {
          let countryDel = await Country.findByIdAndRemove(id);
          if (countryDel = null) {
            res.status(404).send(`The Country with the ID ${id} was not found!`);
          }
        } catch (err) {
          console.log(`Error: ${err.message}`);
          res.status(400).send(`Error: ${err.message}`);
        }
      }        
      res.status(200).send("All Countrys succesfully deleted!");
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.status(400).send(`Error: ${err.message}`);
  };
});

module.exports = router;