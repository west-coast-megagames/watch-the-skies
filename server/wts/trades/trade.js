const routeDebugger = require('debug')('app:routes');

const { Account } = require('../../models/gov/account');
const { Aircraft } = require ('../../models/ops/aircraft');
const { Upgrade } = require ('../../models/gov/upgrade/upgrade')
const { Team } = require ('../../models/team/team');
const { deposit, withdrawal, transfer } = require ("../../wts/banking/banking");
const { TradeReport } = require ('../../wts/reports/reportClasses');

const { Trade } = require('../../models/dip/trade');
const { Research } = require('../../models/sci/research');
const { techTree } = require('../../wts/research/techTree');



async function resolveTrade(req, res){//I have not tested this much at all will need reviewing
    let { initiator, tradePartner } = req.body;
    let trade = await Trade.findById({_id: req.body._id});

    let initiatorReport = new TradeReport;
    let tradePartnerReport = new TradeReport;

    //maybe check to see if the trade data is good.

    initiatorReport.team = initiator.team;
    tradePartnerReport.team = tradePartner.team;

    initiatorReport.trade = initiator.offer;
    tradePartnerReport.trade = tradePartner.offer;
        
    await resolveOffer(initiator.offer, initiator.team, tradePartner.team);     
    await resolveOffer(tradePartner.offer, tradePartner.team, initiator.team);     
               
    initiatorReport.saveReport(initiator.team, initiator.offer);
    tradePartnerReport.saveReport(tradePartner.team, tradePartner.offer);

    trade.status.complete = true;
    trade.status.pending = false;
    trade.status.proposal = false;
    trade = await trade.save();

    res.status(200).send('ok done now');

}//resolveTrade

async function exchangeUpgrade(transferred, newOwner){
    for (let thing of transferred){
        //check what currently has the upgrade
        try{
            let target = await Upgrade.findById(thing);  
            target.team = newOwner;    
            await target.save();            
        }
        catch(err){
            routeDebugger(`ERROR WITH exchangeUpgrade CALL: ${err}`);
            //ADD A RETURN TO LET THE CODE KNOW THE Upgrade WAS NOT TRADED SUCCESSFULLY
        }   
    }//for thing
}//exchangeUpgrade

async function resolveOffer(senderOffer, senderTeam, opposingTeam){
    //case "megabucks":
    routeDebugger(`Working on Megabucks`); 
    if (senderOffer.megabucks > 0){
        try{
            let accountFrom = await Account.findOne({"team" : senderTeam, "name" : "Treasury"});
            let accountTo = await Account.findOne({"team" : opposingTeam, "name" : "Treasury"});
            await withdrawal(accountFrom, senderOffer.megabucks, `Trade with so and so`);
            await deposit(accountTo, senderOffer.megabucks, `Stuff`);              
        }
        catch(err){
            console.log(`ERROR WITH MEGABUCK TRADE: ${err}`);
        }
      
    }

    //case "aircraft" : 
    for (let plane of senderOffer.aircraft){
        routeDebugger(`Working on Aircraft Transfer`); 
        let aircraft = await Aircraft.findById(plane); 
        aircraft.team = opposingTeam; //change the aircraft's team
        exchangeUpgrade(aircraft.systems, opposingTeam); //change the aircraft's Upgrade
        await aircraft.save();
    }//for plane

    //case "research" : 
    for (let item of senderOffer.research){
        //1) get the tech that needs to be copied 
        let tech = await Research.findById(item)
        let newTech = techTree.find(el => el.code === tech.code);

        //2) copy the tech to the new team 
        let createdTech = await newTech.unlock({ _id: opposingTeam});

        //3)with a certain amount researched
        createdTech.progress = 80; //or whatever you want them to get...
        createdTech.save();
        console.log(`Created a new of ${createdTech.name} tech for team: ${createdTech._id}`);
    }//for plane
   
    //case "Upgrade" :
    for (let target of senderOffer.upgrade){
        exchangeUpgrade(target, opposingTeam);           
    }            
}

module.exports = { resolveTrade } 