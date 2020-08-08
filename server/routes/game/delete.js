const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');
const routeDebugger = require('debug')('app:routes:admin');

const {Log} = require('../../models/logs/log');

// @route   DELETE game/delete/logs
// @desc    DELETE all LOG files
// @access  Public
router.delete('/logs', async function (req, res) {
    let data = await Log.deleteMany();
    console.log(data);
    res.status(200).send(`We wiped out ${data.deletedCount} records in the Logs Database!`);
});

module.exports = router

