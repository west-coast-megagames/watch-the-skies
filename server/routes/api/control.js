const express = require('express');
const router = express.Router();

// Interceptor Model - Using Mongoose Model
const { Interceptor } = require('../../models/ops/interceptor');

// @route   PATCH api/control/alien/deploy
// @desc    Update all alien crafts to be deployed
// @access  Public
router.patch('/alien/deploy', async function (req, res) {
    let count = 0;
    for await (const interceptor of Interceptor.find({ 'team.teamName': 'Aliens' })) {
        if (interceptor.status.deployed === false) {
            count++
            interceptor.status.deployed = true;
            await interceptor.save();    
        }
    }
    if (count === 0) {
        res.status(200).send(`No alien crafts availible to deployed...`);
    } else {
        res.status(200).send(`${count} alien crafts have been deployed...`);
    }
});


// @route   PATCH api/control/alien/return
// @desc    Update all interceptors to be not be deployed
// @access  Public
router.patch('/alien/return', async function (req, res) {
    let count = 0;
    for await (const interceptor of Interceptor.find({ 'team.teamName': 'Aliens' })) {
        if (interceptor.status.deployed === true) {
        count++
        interceptor.status.deployed = false;
        await interceptor.save();
        }
    }
    if (count === 0) {
        res.status(200).send(`No alien crafts availible to return to base...`);
    } else {
        res.status(200).send(`${count} alien crafts have returned to base...`);
    }
});

module.exports = router;