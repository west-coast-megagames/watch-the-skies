const express = require('express');
const router = express.Router();
const nexusEvent = require('../../middleware/events/events');
const routeDebugger = require('debug')('app:routes:game');

// Mongoose Models - Used to save and validate objects into MongoDB
const { Facility } = require('../../models/facility');

const science = require('../../wts/research/research');


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~RESEARCH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// @route   GET api/research/sciStats
// @Desc    Get global science state
// @access  Public
router.get('/sciState', async function (req, res) {
	routeDebugger('Sending server science state...');
	const state = {
		fundingCost: science.fundingCost,
		techCost: science.techCost
	};
	res.status(200).json(state);
});

// @route   PUT game/research
// @Desc    Assign a research to a lab
// @access  Public
router.put('/research', async function (req, res) {
	routeDebugger('Updating facility...');
	const update = req.body;
	console.log(update);
	try {
		let facility = await Facility.findById(update._id);

		if (!facility) {
			res
				.status(404)
				.send(`The facility with the ID ${update._id} was not found!`);
		}
		else {
			if (facility.capability.research.active) {
				routeDebugger(
					`${facility.name} lab 0${update.index + 1} is being updated...`
				);
				facility.capability.research.funding.set(
					update.index,
					parseInt(update.funding)
				);
				facility.capability.research.projects.set(
					update.index,
					update.research
				);
				facility.capability.research.status.pending.set(update.index, true);
			}

			facility = await facility.save();
			console.log(facility);
			res
				.status(200)
				.send(
					`Research goals for ${facility.name} lab 0${update.index} have been updated!`
				);
			nexusEvent.emit('updateFacilities');
		}
	}
	catch (err) {
		console.log(err);
		res.status(400).send(err.message);
	}
});


module.exports = router;
