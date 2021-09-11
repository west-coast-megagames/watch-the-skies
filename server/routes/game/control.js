const express = require('express');
const router = express.Router();
const nexusEvent = require('../../middleware/events/events');
const { addArrayValue } = require('../../middleware/util/arrayCalls');

// Aircraft Model - Using Mongoose Model
const { Aircraft } = require('../../models/aircraft');

// @route   PATCH game/control/alien/deploy
// @desc    Update all alien crafts to be deployed
// @access  Public
router.patch('/alien/deploy', async function (req, res) {
	let count = 0;
	let aircrafts = await Aircraft.find().populate('team');
	aircrafts = aircrafts.filter((i) => i.team.type === 'Alien');
	for await (const aircraft of aircrafts) {
		console.log(aircraft);
		if (!aircraft.status.some(el => el === 'deployed')) {
			count++;
			await addArrayValue(this.status, 'deployed');
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
