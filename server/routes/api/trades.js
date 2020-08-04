const routeDebugger = require('debug')('app:routes');

const express = require('express');
const router = express.Router();

// Trade Models - Using Mongoose Model
const { Trade } = require('../../models/dip/trades');
const validateObjectId = require('../../middleware/validateObjectId');

const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

// @route   GET api/trade/
// @Desc    Get all trades
// @access  Public

router.get('/', async function (res, res){
    routeDebugger('Showing all Trades');
    let trade = await Trade.find().sort({ team: 1 });
    res.status(200).json(state);   
    res.json(trade);
}); 

