const express = require('express');
const router = express.Router();
const routeDebugger = require('debug')('app:routes');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging
const { resolveTrade } = require('../../wts/trades/trade');

const { Trade } = require('../../models/trade');
const { Treaty } = require('../../models/treaty');
const { Team } = require('../../models/team');
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TRADE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// @route   POST game/trade
// @Desc    Post a new trade
// @access  Public
router.post('/trade', async function (req, res) {
	logger.info('POST Route: game/blueprints call made...');
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


// @route   PUT game/trade/modify
// @Desc    Modify a specific Trade
// @access  Public
router.put('/trade/modify', async function (req, res) {
	const { initiator, tradePartner } = req.body;
	// console.log(req.body)
	let trade = await Trade.findById({ _id: req.body._id });
	let mName = '';

	if (initiator.modified === true) {// if the initiator modified the trade
		trade.initiator.ratified = true;
		trade.tradePartner.ratified = false;
		trade.initiator.modified = false;
		mName = trade.initiator.team.name;
	}
	else if (tradePartner.modified === true) { // if the partner modified the deal
		trade.tradePartner.modified = false;
		trade.tradePartner.ratified = true;
		trade.initiator.ratified = false;
		mName = trade.tradePartner.team.name;
	}
	else{
		res.status(400).send('Could not determine who modified this trade');
	}

	// save new trade deal over old one
	trade.initiator = initiator;
	trade.tradePartner = tradePartner;

	// set status flags
	trade.status.draft = false;
	trade.status.rejected = false;
	trade.status.deleted = false;
	trade.status.proposal = true;

	trade = await trade.saveActivity(trade, `Trade Modified By ${mName}`);
	res.status(200).send(`Trade deal modified successfully by ${mName}`);
});

// @route   POST game/trades/process
// @Desc    Create a new trade
// @access  Public
router.post('/trade/process', async function (req, res) {
	resolveTrade(req, res);
});

// @route   PUT game/trades/reject
// @Desc    Reject a trade deal
// @access  Public
router.put('/trade/reject', async function (req, res) {
	const { initiator, tradePartner } = req.body;
	let trade = await Trade.findById({ _id: req.body._id }).populate('initiator.team').populate('tradePartner.team');
	let mName = '';

	if (initiator.modified === true) {// if the initiator modified the trade
		trade.initiator.modified = false;
		mName = trade.initiator.team.name;
	}
	else if (tradePartner.modified === true) { // if the partner modified the deal
		trade.tradePartner.modified = false;
		mName = trade.tradePartner.team.name;
	}

	trade.initiator.ratified = false;
	trade.tradePartner.ratified = false;

	// set status flags
	trade.status.draft = false;
	trade.status.rejected = true;
	trade.status.proposal = false;
	trade = await trade.saveActivity(trade, `Trade Rejected By ${mName}`);

	res.status(200).send('Trade Deal Rejected');

});// router

// @route   DELETE game/trades/id
// @Desc    Delete a specific trade
// @access  Public
router.delete('/trade/id', async function (req, res) {
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TREATY~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// @route   PUT game/modify
// @Desc    Modify a treaty
// @access  Public
// EXPECTATIONS: "treaty": {<Treaty Object>}, "changes": [{"changeType": "name of change", data: "<W/E is changing>"}], "modifier": "<modifier team ID>"
/* "changes" methods and logic:
1) "name": replaces treaty's name with whatever "name" is paired with
2) "cost": replaces treaty's cost with whatever "cost" is paired with
3) "author": checks the treaties author array. if the changed author is not in the array, they will be
    added, then will check and add them to witnesses if they are absent. Else if they are already
    in the array, they will be removed from the authorship (but NOT from witness)
4) "witness": adds the desired team to the witness array only if they aren't in there already
5) "excluded":
6) "expiration": replaces treaty's name with whatever "expiration" is paired with
7) "alliance":
8) "clauses": replaces treaty's cost with whatever "clauses" is paired with
9) "violition": replaces treaty's cost with whatever "violition" is paired with
10) "status": NOT HERE making it's own thing
*/
router.put('/treaties/modify', async function (req, res) {
	let { treaty, modifier } = req.body;
	const { changes } = req.body;
	if (treaty.status.draft === false) {
		res.status(400).send('Cannot modify a treaty that is in the proposal state');
	}
	try{
		let cNum = 0;
		let newAuthor;
		let newWitness;
		treaty = await Treaty.findById({ _id: treaty._id });// populate treaty
		modifier = await Team.findById({ _id: modifier });
		for (const element of changes) {
			switch(element.changeType) {
			case 'name':// change the name of the treaty
				treaty.name = element.data;
				cNum++;
				break;
			case 'cost':// adjust cost of treaty
				treaty.cost = element.data;
				cNum++;
				break;
			case 'author':// add authorship rights of this treaty for another team
				newAuthor = await Team.findById({ _id: element.data });
				// step 1) check to see if author is being removed or added to treaty
				if(!treaty.authors.includes(newAuthor._id)) {// if the treaty does not have this author
					treaty.authors.push(newAuthor._id); // add new author to treaty
					if(!treaty.witness.includes(newAuthor._id)) {
						treaty.witness.push(newAuthor._id); // add new author to treaty's witness array
					}
					if (!newAuthor.treaties.includes(treaty._id)) {// if the team treaty array does NOT have this treaty in it
						newAuthor.treaties.push(treaty._id);
					}
				}// if the treaty does not have this author
				else{
					const x = treaty.authors.indexOf(newAuthor._id);
					treaty.authors.splice(x, 1);// remove author from treaty array
				}
				newAuthor = await newAuthor.save();
				cNum++;
				break;
			case 'witness':// allow other teams to view this treaty
				newWitness = await Team.findById({ _id: element.data });
				if(!treaty.witness.includes(newWitness._id)) {// if witness is not in the treaty array yet
					treaty.witness.push(newWitness._id);
					newWitness.treaties.push(treaty._id);
					cNum++;
				}
				break;
			case 'excluded':// block country from ratifying this treaty
				// COME BACK AND DO THIS CODE YOU COWARD
				break;
			case 'expiration':// change the expiration date
				treaty.expiration = element.data;
				cNum++;
				break;
			case 'alliance':// add an alliance type to the treaty
				// once we figure out what alliances are n such we'll come back
				if(!treaty.alliances.includes(element.data)) {
					treaty.alliances.push(element.data);
				}
				else{
					const x = treaty.alliances.indexOf(element.data);
					treaty.alliances.splice(x, 1);// remove author from treaty array
				}
				break;
			case 'clauses':// change the clauses of the treaty
				treaty.clauses = element.data;
				cNum++;
				break;
			case 'violition':// change the violition of the treaty
				treaty.violition = element.data;
				cNum++;
				break;
			}// switch
		}// for
		treaty = await treaty.saveActivity(treaty, `${cNum} Elements of Treaty Modified `);
		res.status(200).send(`${cNum} Elements of Treaty Modified by ${modifier.name}`);
	}
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(500).send(`Error modifying treaty: ${err}`);
	}// catch
});

// @route   PUT game/treaties/ratify
// @Desc    Ratify a treaty for your team
// @access  Public
// EXPECTATIONS: "treaty": {<Treaty Object>}, "ratifier": "<ID>"
// I am assuming that the person ratifying this treaty has access to it through witnessing, and am not handling any logic whether they
// are allowed to sign treaty (through the 'excluded' array property of the Treaty Obj)
router.put('/treaties/ratify', async function (req, res) {
	try {
		let { treaty, ratifier } = req.body;
		treaty = await Treaty.findById({ _id: treaty._id });// populate treaty
		treaty.signatories.push(ratifier);
		ratifier = await Team.findById({ _id: ratifier });
		ratifier.treaties.push(treaty._id);
		ratifier = await ratifier.save();

		treaty = await treaty.saveActivity(treaty, `Treaty Ratified By ${ratifier.name}`);
		res.status(200).send(`Treaty Ratified By ${ratifier.name}!`);
	}
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(500).send(`Error ratifying treaty: ${err}`);
	}// catch
});

// @route   POST game/treaties/status
// @Desc    changes a status of a treaty to wither draft or proposal.... no idea if this is needed anymore?
// @access  Public
// EXPECTATIONS: "treaty": {<Treaty Object>}, "modifier": "<ID>", "status"
router.put('/treaties/status', async function (req, res) {
	let { treaty } = req.body;
	const { modifier, status } = req.body;
	try{
		treaty = await Treaty.findById({ _id: treaty._id });// populate treaty
		if(modifier != treaty.creator) {
			res.status(400).send('Cannot modify treaty status if you are not it\'s creator');
		}
		treaty.status.draft = false;
		treaty.status.proposal = false;
		treaty.status.deleted = false;

		switch(status) {
		case 'draft':
			treaty.status.draft = true;
			break;
		case 'proposal':
			treaty.status.proposal = true;
			break;
		}// switch(status)
		treaty = await treaty.saveActivity(treaty, `Treaty Status Changed ${modifier.name}`);
		res.status(200).send(`Treaty Status Changed ${modifier.name}!`);
	}
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(400).send(`Error changing treaty status: ${err}`);
	}// catch
});

module.exports = router;