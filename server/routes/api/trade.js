const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();
// const nexusEvent = require('../../startup/events');

const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging

// Trade Models - Using Mongoose Model
const { Team } = require('../../models/team');
const { Trade } = require('../../models/trade');

// @route   GET api/trade
// @Desc    Get all trades
// @access  Public
router.get('/', async function (req, res) {
	routeDebugger('Showing all Trades');
	const trade = await Trade.find().sort({ team: 1 });
	res.status(200).json(trade);
});

// @route   POST api/trades
// @Desc    Post a new trade
// @access  Public
router.post('/', async function (req, res) {
	console.log(req.body);
	const { tradePartner, initiator } = req.body;
	/*
    if ( tradePartner.offer.length < 1 && initiator.offer.length < 1 ){
        res.status(400).send(`This trade is empty!`);
    }
    */
	let trade = new Trade(req.body);

	// get actual trade object and then push on their array
	let initiatorTeam = await Team.findById({ _id: initiator });
	trade = await trade.saveActivity(trade, `Trade Created By ${initiatorTeam.name}`);
	initiatorTeam.trades.push(trade._id);
	initiatorTeam = await initiatorTeam.save();

	trade.initiator.team = initiatorTeam;
	trade.tradePartner.team = await Team.findById({ _id: tradePartner });

	// nexusEvent.emit('updateTeam');
	routeDebugger(trade);
	res.status(200).json(trade);
});

// @route   DELETE api/trades
// @Desc    Delete all trades
// @access  Public
router.delete('/', async function (req, res) {
	const data = await Trade.deleteMany();
	const teams = await Team.find();
	for (const team of teams) {
		team.trades = [];
		team.save();
	}
	res.status(200).send(`We killed ${data.deletedCount}`);
});

// @route   DELETE api/trades/id
// @Desc    Delete a specific trade
// @access  Public
router.delete('/id', async function (req, res) {
	try{
		const removalTeam = await Team.findById({ _id: req.body.teamID });
		for (let i = 0; i < removalTeam.trades.length; i++) {
			if (removalTeam.trades[i] == req.body.tradeID) {
				removalTeam.trades.splice(i, 1);
				removalTeam.save();
			}
		}
		let trade = await Trade.findById({ _id: req.body._id });
		trade.status.deleted = true;
		trade = await trade.saveActivity(trade, `Trade Closed By ${removalTeam.name}`);

		res.status(200).send(`We killed trade: ${req.body.tradeID}`);
	}// try
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(400).send(`Error deleting trade: ${err}`);
	}// catch
});

module.exports = router;