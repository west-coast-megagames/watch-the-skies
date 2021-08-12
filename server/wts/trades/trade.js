const routeDebugger = require('debug')('app:routes');

const { Account } = require('../../models/account');
const { Aircraft } = require ('../../models/aircraft');
const { Upgrade } = require ('../../models/upgrade');
const { TradeReport } = require ('../../models/report');

const { Trade } = require('../../models/trade');
const { Research } = require('../../models/research');
const { techTree } = require('../../wts/research/techTree');
const { Team } = require('../../models/team');
const nexusEvent = require('../../middleware/events/events');

async function createTrade(data) {
	const initiator = await Team.findById(data.initiator);
	const tradePartner = await Team.findById(data.tradePartner);
	let newTrade = new Trade();
	newTrade.initiator = initiator;
	newTrade.tradePartner = tradePartner;
	newTrade = await newTrade.save();

	nexusEvent.emit('request', 'create', [ newTrade ]); //
	return { message : `${initiator.shortName} created a new Trade...`, type: 'success' };
}

async function resolveTrade(req, res) {// I have not tested this much at all will need reviewing
	const { initiator, tradePartner } = req.body;
	let trade = await Trade.findById({ _id: req.body._id });

	const initiatorReport = new TradeReport;
	const tradePartnerReport = new TradeReport;

	// maybe check to see if the trade data is good.

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

}// resolveTrade

async function exchangeUpgrade(transferred, newOwner) {
	for await (const thing of transferred) {
		// check what currently has the upgrade
		try{
			const target = await Upgrade.findById(thing);
			target.team = newOwner;
			await target.save();
		}
		catch(err) {
			routeDebugger(`ERROR WITH exchangeUpgrade CALL: ${err}`);
			// ADD A RETURN TO LET THE CODE KNOW THE Upgrade WAS NOT TRADED SUCCESSFULLY
		}
	}// for thing
}// exchangeUpgrade

async function resolveOffer(senderOffer, senderTeam, opposingTeam) {
	// case "megabucks":
	routeDebugger('Working on Megabucks');
	if (senderOffer.megabucks > 0) {
		try{
			const accountFrom = await Account.findOne({ 'team' : senderTeam, 'name' : 'Treasury' });
			const accountTo = await Account.findOne({ 'team' : opposingTeam, 'name' : 'Treasury' });
			await accountFrom.withdrawal({ from: accountFrom._id, to: accountTo._id, amount: senderOffer.megabucks, note: 'Trade with so and so' });
			await accountTo.deposit({ from: accountFrom._id, to: accountTo._id, amount: senderOffer.megabucks, note: 'Trade with so and so' });
		}
		catch(err) {
			console.log(`ERROR WITH MEGABUCK TRADE: ${err}`);
		}

	}

	// case "aircraft" :
	for await (const plane of senderOffer.aircraft) {
		routeDebugger('Working on Aircraft Transfer');
		const aircraft = await Aircraft.findById(plane);
		aircraft.team = opposingTeam; // change the aircraft's team
		exchangeUpgrade(aircraft.systems, opposingTeam); // change the aircraft's Upgrade
		await aircraft.save();
	}// for plane

	// case "research" :
	for await (const item of senderOffer.research) {
		// 1) get the tech that needs to be copied
		const tech = await Research.findById(item);
		const newTech = techTree.find(el => el.code === tech.code);

		// 2) copy the tech to the new team
		const createdTech = await newTech.unlock({ _id: opposingTeam });

		// 3)with a certain amount researched
		createdTech.progress = 80; // or whatever you want them to get...
		createdTech.save();
		console.log(`Created a new of ${createdTech.name} tech for team: ${createdTech._id}`);
	}// for plane

	// case "Upgrade" :
	for await (const target of senderOffer.upgrade) {
		exchangeUpgrade(target, opposingTeam);
	}
}

module.exports = { resolveTrade, createTrade };