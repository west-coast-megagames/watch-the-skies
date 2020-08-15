const routeDebugger = require('debug')('app:routes');

const { Account } = require('../../models/gov/account');
const { Aircraft } = require ('../../models/ops/aircraft');
const { Equipment } = require ('../../models/gov/equipment/equipment')
const { Team } = require ('../../models/team/team');
const { deposit, withdrawal, transfer } = require ("../../wts/banking/banking");
const { TradeReport } = require ('../../wts/reports/reportClasses');

const { Trade } = require('../../models/dip/trades');
const { Research } = require('../../models/sci/research');
const { techTree } = require('../../wts/research/techTree');



async function resolveTrade(req, res){
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
            let team = element.team;
            let opposingTeam = (team === team1) ? team2 : team1;            

            routeDebugger(`Working on offer of ${element.team} of ${team}`);        

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
                            exchangeEquipment(aircraft.systems, opposingTeam); //change the aircraft's equiptment

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
                            createdTech.progress = 80; //or whatever you want them to get...
                            createdTech.save();
                            console.log(`Created a new of ${createdTech.name} tech for team: ${createdTech._id}`);
                        }//for plane
                        break;
                    case "equiptment" :            
                        exchangeEquipment(target, opposingTeam);   
                        break;
                    case "facility":
                        //we'll come back right after these messages
                        break;
                }//switch (key)
            }//for Object.entries            
        }//for (let element)

    }//else if
    report.saveReport(offer[0].team);
    report.saveReport(offer[1].team);
    res.status(200).send('ok done now');
}//resolveTrade

async function exchangeEquipment(transferred, newOwner){
    for (let thing of transferred){
        //check what currently has the equiptment
        try{
            let target = await Equipment.findById(thing);  
            target.team = newOwner;    
            await target.save();            
        }
        catch(err){
            routeDebugger(`ERROR WITH exchangeEquiptment CALL: ${err}`);
            //ADD A RETURN TO LET THE CODE KNOW THE EQUIPTMENT WAS NOT TRADED SUCCESSFULLY
        }   
    }//for thing
}//exchangeEquipment

module.exports = { resolveTrade } 