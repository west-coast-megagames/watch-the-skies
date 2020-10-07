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
	aircrafts = aircrafts.filter((i) => i.team.type === 'A');
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

module.exports = router;
