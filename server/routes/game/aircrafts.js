const express = require('express');
const router = express.Router();

const { newUnit } = require('../../wts/construction/construction');

// @route   POST game/aircrafts/build
// @Desc    Takes in blueprint and name and facility(?) and starts construction on a new aircraft
// @access  Public
// currently not used by frontend
router.post('/build', async (req, res) => {
	const { name, facility, type, team } = req.body; // please give me these things
	try {
		const aircraft = await newUnit(name, facility, type, team); // just the facility ID
		res.status(200).send(aircraft);
	}
	catch (err) {
		res.status(404).send(err);
	}
});

module.exports = router;