const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();
const { Account } = require('../../models/gov/account');
const { Aircraft } = require ('../../models/ops/aircraft')
const { Team } = require ('../../models/team/team')
const { deposit, withdrawal, transfer } = require ("../../wts/banking/banking")
const { TradeReport } = require ('../../wts/reports/reportClasses')

// Trade Models - Using Mongoose Model
const { Trade } = require('../../models/dip/trades');
const { Research } = require('../../models/sci/research');
const { techTree } = require('../../wts/research/techTree');

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
    let { offer, status } = req.body;
   
    if (offer.length < 1){
        res.status(400).send(`You dummy sent me the bad info for this trade`);
    }
    let trade = new Trade(req.body);
    trade = await trade.save();
    res.status(200).json(trade);
});

router.delete('/', async function (req, res){
    let data = await Trade.deleteMany();
    res.status(200).send(`We killed ${data.deletedCount}`)    
});

router.post('/process', async function (req, res){
    console.log(req.body); 
    let report = new TradeReport;

    let { offer, status } = req.body;
   
    if (offer.length < 1){
        res.status(400).send(`You dummy sent me the bad info for this trade`);
    }
    else if (offer.length === 2){
        let team1 = offer[0].team;
        let team2 = offer[1].team;

        report.team1 = team1;
        report.team2 = team2;
        report.offer1 = offer[0];
        report.offer2 = offer[1];

        for (let element of offer){
            let team = element.team
            let opposingTeam = (team === team1) ? team2 : team1;            

            routeDebugger(`Working on offer of ${element} of ${team}`);        

            for (let [key, value] of Object.entries(element)){
                console.log(`${key}, ${value}`);
                routeDebugger(`Working on element ${key} of value ${value}`);
               
                switch (key){
                    case "megabucks":
                        routeDebugger(`Working on Megabucks`); 
                        let accountFrom = await Account.findOne({"team" : team, "name" : "Treasury"});
                        let accountTo = await Account.findOne({"team" : opposingTeam, "name" : "Treasury"});

                        await withdrawal(accountFrom, value, `Trade with so and so`);
                        await deposit(accountTo, value, `Stuff`);
                        break;
                    case "aircraft" : 
                        for (let plane of value){
                            routeDebugger(`Working on Aircraft Transfer`); 
                            let aircraft = await Aircraft.findById(plane); 
                            aircraft.team = opposingTeam; //change the aircraft's team
                            exchangeEquiptment(aircraft.systems, opposingTeam); //change the aircraft's equiptment

                            await aircraft.save();
                        }//for plane
                        break;
                    case "research" : 
                        for (let item of value){
                            //1) get the tech that needs to be copied 
                            let tech = await Research.findById(item)
                            let newTech = techTree.find(el => el.code === tech.code);
                            //2) copy the tech to the new team 
                            let createdTech = await newTech.unlock({ _id: opposingTeam});
                            //3)with a certain amount researched
                            console.log(createdTech.team, opposingTeam);
                        }//for plane
                        break;
                    case "equiptment" :                   
                        exchangeEquiptment(target, opposingTeam);   
                        break;
                }//switch (key)
            }//for Object.entries            
        }//for (let element)

    }//else if
    report.saveReport(offer[0].team);
    report.saveReport(offer[1].team);
    res.status(200).send('ok done now');
});//router

async function exchangeEquiptment(transferred, newOwner){
    for (let thing of transferred){
        //check what currently has the equiptment
        try{
            let target = await Equiptment.findById(thing);  
            target.team = newOwner;    
            await target.save();            
        }
        catch(err){
            routeDebugger(`ERROR WITH exchangeEquiptment CALL: ${err}`)
        }   
    }//for thing
}//exchangeEquiptment

module.exports = router;