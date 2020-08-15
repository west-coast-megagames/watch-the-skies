const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();


// Trade Models - Using Mongoose Model
const { Trade } = require('../../models/dip/trades');

const { resolveTrade } = require('../../wts/trades/trade')


// @route   GET api/trades
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
    let { offer } = req.body;
   
    if (offer.length < 1){
        res.status(400).send(`This trade is empty!`);
    }
    let trade = new Trade(req.body);
    trade = await trade.save();
    for await (let offer of trade.offer) {
        offer.team = await Team.findById(offer.team)
    }
    routeDebugger(trade);
    res.status(200).json(trade);
});

router.delete('/', async function (req, res){
    let data = await Trade.deleteMany();
    res.status(200).send(`We killed ${data.deletedCount}`)    
});

router.post('/process', async function (req, res){
    resolveTrade(req, res);
    
});//router



module.exports = router;