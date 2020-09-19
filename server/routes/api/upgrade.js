const express = require("express");
const router = express.Router();
const nexusEvent = require("../../startup/events");
const routeDebugger = require("debug")("app:routes:interceptor");

const { Upgrade } = require('../../models/gov/upgrade/upgrade');
const { upgradeValue, addUpgrade, removeUpgrade } = require('../../wts/upgrades/upgrades');

// @route   GET api/upgrades
// @Desc    Get all Upgrades
// @access  Public
router.get('/', async function (req, res){
	let aircrafts = await Upgrade.find();
	res.json(aircrafts);
});

router.get('/stat', async function (req, res){
	let z = await upgradeValue(req.body.upgrades, req.body.desiredStat);
	res.status(200).send(`The result is: ${z}`);
});

router.put('/add', async function (req, res){
 await addUpgrade(req.body.upgrade, req.body.unit);
 res.status(200).send(`Added "${req.body.upgrade.name}" to unit "${req.body.unit.name}"`);
});

router.put('/remove', async function (req, res){
	let response = await removeUpgrade(req.body.upgrade, req.body.unit);
	res.status(200).send(response);
 });

module.exports = router;