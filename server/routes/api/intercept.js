const express = require('express');
const router = express.Router();
const interceptTest = require('../../util/systems/intercept');

// Item Model
const Interceptor = require('../../models/interceptor');

// @route   GET api/intercept
// @Desc    Find interceptor and activate interceptTest
// @access  Public
router.get('/', (req, res) => {
    request = req.body
    Interceptor.findOne({ 'designation': 'Update Test 2' }, function (err, interceptor) {
        if (err) return handleError(err);
        console.log(interceptor.designation);
        interceptTest(interceptor);
    })
        .then(interceptor => res.json(interceptor));
});


// @route   GET api/intercept/intercept2
// @Desc    Unknown
// @access  Public
router.get('/intercept2', (req, res) => {
    console.log(req.body);
    let attacker = {}
    let defender = {}
    Interceptor.findOne({ '_id': req.body.attacker }, function (err, interceptor) {
        if (err) return handleError(err);
        console.log(`Attacker is ${interceptor.designation}`);
        attacker = interceptor;
    })
        .then(interceptor => res.json(interceptor));

    /*
    Interceptor.findOne({ '_id': req.body.defender }, function (err, interceptor) {
        if (err) return handleError(err);
        console.log(`Defender is ${interceptor.designation}`);
        defender = interceptor;
    })
        .then(interceptor => res.json(interceptor));

    interceptTest(attacker, defender, req.body.atkStatus)
    */
});

module.exports = router;