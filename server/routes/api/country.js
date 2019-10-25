const express = require('express');
const router = express.Router();

// Country Model - Using Mongoose Model
const Country = require('../../models/country'); 

// @route   GET api/countrys
// @Desc    Get all ACTIVE countrys
// @access  Public
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

// @route   GET api/id/countrys
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

// @route   GET api/id/countrys
// @Desc    Get countrys by id
// @access  Public
router.get('/code/:code', async (req, res) => {
  let code = req.params.code;
  console.log("jeff in get countries by code", code);
  try {
    let country = await Country.find({ code });
    console.log("jeff after find ... ", country);
    if (country.length) {
      res.json(country);
    } else {
      res.status(404).send(`The Country with the code ${code} was not found!`);
    }
  } catch (err) {
      console.log('Error:', err.message);
      res.status(400).send(err.message);
  }
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