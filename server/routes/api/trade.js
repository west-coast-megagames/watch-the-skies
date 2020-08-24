const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');

const { logger } = require('../../middleware/winston'); // Import of winston for error logging

// Trade Models - Using Mongoose Model
const { Trade } = require('../../models/dip/trade');
const { Team } = require('../../models/team/team');

const { resolveTrade } = require('../../wts/trades/trade')


// @route   GET api/trade
// @Desc    Get all trades
// @access  Public
router.get('/', async function (req, res){
    routeDebugger('Showing all Trades');
    let trade = await Trade.find().sort({ team: 1 });  
    res.status(200).json(trade);
}); 

// @route   POST api/trades
// @Desc    Post a new trade
// @access  Public
router.post('/', async function (req, res){
    console.log(req.body); 
    let { tradePartner, initiator } = req.body;
   /*
    if ( tradePartner.offer.length < 1 && initiator.offer.length < 1 ){
        res.status(400).send(`This trade is empty!`);
    }
    */
    let trade = new Trade(req.body);

    //get actual trade object and then push on their array
    let initiatorTeam = await Team.findById({_id: initiator});
    trade = await trade.saveActivity(trade, `Trade Created By ${initiatorTeam.name}`);    
    initiatorTeam.trades.push(trade._id);
    initiatorTeam = await initiatorTeam.save();



    trade.initiator.team = initiatorTeam;
    trade.tradePartner.team = await Team.findById({_id: tradePartner});

    //nexusEvent.emit('updateTeam');
    routeDebugger(trade);
    res.status(200).json(trade);
});

// @route   DELETE api/trades
// @Desc    Delete all trades
// @access  Public
router.delete('/', async function (req, res){

    let data = await Trade.deleteMany();
    let teams = await Team.find();
    for (let team of teams){
        team.trades = [];
        team.save();
    }
    res.status(200).send(`We killed ${data.deletedCount}`)    
});

// @route   DELETE api/trades/id
// @Desc    Delete a specific trade
// @access  Public
router.delete('/id', async function (req, res){
    try{
        let removalTeam = await Team.findById({_id: req.body.teamID});
        for (i=0; i< removalTeam.trades.length; i++){
            if (removalTeam.trades[i] == req.body.tradeID){
                removalTeam.trades.splice(i, 1);
                removalTeam.save();
            }
        }
        let trade = await Trade.findById({_id: req.body._id});
        trade.status.deleted = true;
        trade = await trade.saveActivity(trade, `Trade Closed By ${removalTeam.name}`);

        res.status(200).send(`We killed trade: ${req.body.tradeID}`);            
    }//try
    catch (err) {
    logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
      meta: err,
    });
    res.status(400).send(`Error deleting trade: ${err}`);
  }//catch
});

// @route   PUT api/trades/modify
// @Desc    Modify a specific Trade
// @access  Public
router.put('/modify', async function (req, res){
    let { initiator, tradePartner } = req.body;
    //console.log(req.body)
    let trade = await Trade.findById({_id: req.body._id});
    let mName = "";


    if (initiator.modified === true){//if the initiator modified the trade
        trade.initiator.ratified = true;
        trade.tradePartner.ratified = false;
        trade.initiator.modified = false;
        mName = trade.initiator.team.name;
    }
    else if (tradePartner.modified === true){ //if the partner modified the deal
        trade.tradePartner.modified = false;
        trade.tradePartner.ratified = true;
        trade.initiator.ratified = false;
        mName = trade.tradePartner.team.name;
    }
    else
        res.status(400).send(`Could not determine who modified this trade`); 

    //save new trade deal over old one
    trade.initiator = initiator; 
    trade.tradePartner = tradePartner; 

    //set status flags
    trade.status.draft = false;
    trade.status.rejected = false;
    trade.status.deleted = false;
    trade.status.proposal = true;
    
    trade = await trade.saveActivity(trade, `Trade Modified By ${mName}`);
    res.status(200).send(`Trade deal modified successfully by ${mName}`); 
}); 

// @route   POST api/trades/process
// @Desc    Create a new trade
// @access  Public
router.post('/process', async function (req, res){
    resolveTrade(req, res);
});//router

// @route   PUT api/trades/reject
// @Desc    Reject a trade deal
// @access  Public
router.put('/reject', async function (req, res){
    let { initiator, tradePartner } = req.body;
    let trade = await Trade.findById({_id: req.body._id}).populate("initiator.team").populate("tradePartner.team");
    let mName = "";

    if (initiator.modified === true){//if the initiator modified the trade
        trade.initiator.modified = false;
        mName = trade.initiator.team.name;
    }
    else if (tradePartner.modified === true){ //if the partner modified the deal
        trade.tradePartner.modified = false;
        mName = trade.tradePartner.team.name;
    }

    trade.initiator.ratified = false;
    trade.tradePartner.ratified = false;

    //set status flags
    trade.status.draft = false;
    trade.status.rejected = true;
    trade.status.proposal = false;
    trade = await trade.saveActivity(trade, `Trade Rejected By ${mName}`);

    res.status(200).send(`Trade Deal Rejected`); 

});//router

module.exports = router;