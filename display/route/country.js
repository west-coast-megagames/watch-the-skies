const express = require('express'); // Import of EXPRESS to create the router
const restApi = require('../request'); // Import of the request module with a REST api call function.

const router = express.Router(); // Creation of the EXPRESS router

// @route   GET /country
// @Desc    Get all Articles
// @access  Public
router.get('/', async function (req, res) {
    console.log('Gathering all countries!');
    restApi('https://project-nexus-prototype.herokuapp.com/api/country')
    .then(response => {
        res.json(response)
    })
    .catch(error => {
        res.status(400).send(`Error: ${error}`)
    })
});

// @route   GET /country/byZone
// @Desc    Get all Articles
// @access  Public
router.get('/', async function (req, res) {
    console.log('Gathering all zones!');
    restApi('https://project-nexus-prototype.herokuapp.com/api/contry/byZones')
    .then(response => {
        res.json(response)
    })
    .catch(error => {
        res.status(400).send(`Error: ${error}`)
    })
});


module.exports = router;