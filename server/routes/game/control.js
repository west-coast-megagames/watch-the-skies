const express = require('express');
const router = express.Router();
const nexusEvent = require('../../middleware/events/events');

// Aircraft Model - Using Mongoose Model
const { Aircraft } = require('../../models/aircraft');

// @route   PATCH api/control/alien/deploy
// @desc    Update all alien crafts to be deployed
// @access  Public
router.patch('/alien/deploy', async function (req, res) {
	let count = 0;
	let aircrafts = await Aircraft.find().populate('team');
	aircrafts = aircrafts.filter((i) => i.team.teamType === 'A');
	for await (const aircraft of aircrafts) {
		console.log(aircraft);
		if (aircraft.status.deployed === false) {
			count++;
			aircraft.status.deployed = true;
			await aircraft.save();
		}
	}
	if (count === 0) {
		res.status(200).send('No alien crafts available to deployed...');
	}
	else {
		res.status(200).send(`${count} alien crafts have been deployed...`);
	}

	nexusEvent.emit('updateAircrafts');
});

// @route   PATCH api/control/alien/return
// @desc    Update all aircrafts to be not be deployed
// @access  Public
router.patch('/alien/return', async function (req, res) {
	let count = 0;
	let aircrafts = await Aircraft.find().populate('team');
	aircrafts = aircrafts.filter((i) => i.team.teamType === 'A');
	for await (const aircraft of aircrafts) {
		if (aircraft.status.deployed === true) {
			count++;
			aircraft.status.deployed = false;
			await aircraft.save();
		}
	}
	if (count === 0) {
		res.status(200).send('No alien crafts available to return to base...');
	}
	else {
		res.status(200).send(`${count} alien crafts have returned to base...`);
	}
	nexusEvent.emit('updateAircrafts');
});

module.exports = router;
