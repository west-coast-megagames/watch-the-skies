const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

// Trade Models - Using Mongoose Model
const { Trade } = require('../../models/dip/trades');

// @route   GET api/trade/
// @Desc    Get all trades
// @access  Public
router.get('/', async function (res, res){
    routeDebugger('Showing all Trades');
    let trade = await Trade.find().sort({ team: 1 });  
    res.status(200).json(trade);
}); 

module.exports = router;