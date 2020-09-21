const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

const { Treaty } = require('../../models/dip/treaty');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
const { Team } = require('../../models/team/team');

// @route   GET api/treaties
// @Desc    Get all Treaties
// @access  Public
router.get('/', async function (req, res) {
	routeDebugger('Showing all Treaties');
	const treaties = await Treaty.find().sort({ team: 1 });
	res.status(200).json(treaties);
});

// @route   POST api/treaties
// @Desc    Post a new treaty
// @access  Public
// EXPECTATIONS: "creator": "<team ID>", "name": "<Anything the player wants the Treaty to be named>"
router.post('/', async function (req, res) {
	let { creator } = req.body;
	try{
		let treaties = new Treaty(req.body);
		creator = await Team.findById({ _id: creator }); // populate creator's team so we can pass it back
		creator.treaties.push(treaties._id);
		creator = await creator.save();
		// nexusEvent.emit('updateTeam');
		treaties = await treaties.saveActivity(treaties, `Treaty Created By ${creator.name}`);
		routeDebugger(treaties);
		res.status(200).json(treaties);
	}
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(400).send(`Error creating treaty: ${err}`);
	}// catch

});

// @route   DELETE api/treaties
// @Desc    Delete all treaties
// @access  Public
router.delete('/', async function (req, res) {

	const data = await Treaty.deleteMany();
	const teams = await Team.find();
	for (const team of teams) {
		team.treaties = [];
		team.save();
	}
	res.status(200).send(`We killed ${data.deletedCount}`);
});

// @route   DELETE api/treaties/id
// @Desc    Delete a specific treaty
// @access  Public
// EXPECTATIONS: The treaty itself (at least the ID and the status of the Treaty)
// This DELETE should only be called by the creator of a treaty and only while the treaty is a draft. Once a treaty is 'live' there should be no way to delete a treaty
router.delete('/id', async function (req, res) {
	if (req.body.status.proposal) {
		res.status(400).send('You cannot delete a Treaty once it has been published');
	}
	try{
		let treaty = await Treaty.findById({ _id: req.body._id });

		treaty.status.deleted = true;
		treaty = await treaty.saveActivity(treaty, `Treaty Deleted By ${treaty.creator}`);
		const temp = treaty.name;
		await Treaty.findByIdAndDelete({ _id: req.body._id });
		// AND remove the deleted treaty from the teams maybe?

		res.status(200).send(`We killed treaty: ${temp}`);
	}// try
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(400).send(`Error deleting treaty: ${err}`);
	}// catch
});

module.exports = router;