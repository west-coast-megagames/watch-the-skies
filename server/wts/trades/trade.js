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
	let { initiator, tradePartner } = data;
	initiator = await Team.findById(initiator);
	tradePartner = await Team.findById(tradePartner);

	let newTrade = new Trade();
	newTrade.initiator.team = initiator;
	newTrade.tradePartner.team = tradePartner;
	await newTrade.save();
	newTrade = await Trade.findById(newTrade._id)
		.populate('initiator.team', 'shortName name code')
		.populate('tradePartner.team', 'shortName name code'); 

	nexusEvent.emit('request', 'create', [ newTrade ]); //
	return { message : `${initiator.shortName} created a new Trade...`, type: 'success' };
}

async function editTrade(data) {
	let { offer, editor, trade } = data;
	trade = await Trade.findById(trade)
		.populate('initiator.team', 'shortName name code')
		.populate('tradePartner.team', 'shortName name code');

	trade.initiator.team._id.toHexString() === editor ? trade.initiator.offer = offer : trade.tradePartner.offer = offer;
	trade.initiator.ratified = false;
	trade.tradePartner.ratified = false;

	trade.status = 'Draft';

	trade = await trade.save();
	trade = await trade
		.populate('initiator.team', 'shortName name code')
		.populate('tradePartner.team', 'shortName name code');

	nexusEvent.emit('request', 'update', [ trade ]); //
	return { message : `Trade Edited...`, type: 'success' };
}

async function approveTrade(data) {
	let { ratifier, trade } = data;
	trade = await Trade.findById(trade)
		.populate('initiator.team', 'shortName name code')
		.populate('tradePartner.team', 'shortName name code');

	trade.initiator.team._id.toHexString() == ratifier ? trade.initiator.ratified = true : trade.tradePartner.ratified = true;

	if (trade.initiator.ratified && trade.tradePartner.ratified) {
		resolveTrade(trade._id);
	}
	else {
		trade = await trade.save();
		nexusEvent.emit('request', 'update', [ trade ]);
	}

	return { message : `Trade Edited...`, type: 'success' };
}

async function rejectTrade(data) {
	let { rejecter, trade } = data;
	trade = await Trade.findById(trade)
		.populate('initiator.team', 'shortName name code')
		.populate('tradePartner.team', 'shortName name code');
	// console.log(trade.initiator.ratified);
	// console.log(trade.tradePartner.ratified);

	trade.initiator.team._id == rejecter ? trade.initiator.ratified = false : trade.tradePartner.ratified = false;
	trade = await trade.save();
	// console.log(trade.initiator.ratified);
	// console.log(trade.tradePartner.ratified);
	nexusEvent.emit('request', 'update', [ trade ]); //
	return { message : `Trade Edited...`, type: 'success' };
}

async function trashTrade(data) {
	let { trade } = data;
	trade = await Trade.findById(trade);

	trade.status = 'Trashed';

	trade = await trade.save();
	trade = await trade.populateMe();
	console.log(trade);
	nexusEvent.emit('request', 'update', [ trade ]); //
	return { message : `${data.trasher} trashed a Trade...`, type: 'success' };
}

async function resolveTrade(id) {// I have not tested this much at all will need reviewing
	console.log(`Resolving Trade ${id}`);
	let trade = await Trade.findById(id);
	const { initiator, tradePartner } = trade;

	const initiatorReport = new TradeReport;
	const tradePartnerReport = new TradeReport;

	// maybe check to see if the trade data is good.

	initiatorReport.team = initiator.team;
	tradePartnerReport.team = tradePartner.team;

	initiatorReport.trade = initiator.offer;
	tradePartnerReport.trade = tradePartner.offer;

	// add check to see if the owner of something is still it's owner at time of transaction
	if (tradePartner.offer.aircraft && tradePartner.offer.aircraft.length > 0) {
		await checkThing(tradePartner.team, tradePartner.offer.aircraft);
	}
	if (initiator.offer.aircraft && initiator.offer.aircraft.length > 0) {
		await checkThing(initiator.team, initiator.offer.aircraft);
	}


	await resolveOffer(initiator.offer, initiator.team, tradePartner.team);
	await resolveOffer(tradePartner.offer, tradePartner.team, initiator.team);

	trade.status = 'Completed';
	trade.initiator.ratified = true;
	trade.tradePartner.ratified = true;
	trade = await trade.save();
	trade = await trade
		.populate('initiator.team', 'shortName name code')
		.populate('tradePartner.team', 'shortName name code');

	// TODO: John re-implement reports
	// initiatorReport.saveReport(initiator.team, initiator.offer);
	// tradePartnerReport.saveReport(tradePartner.team, tradePartner.offer);
	nexusEvent.emit('request', 'broadcast', { type: 'success', message: 'Trade deal Completed!' });
	nexusEvent.emit('request', 'update', [ trade ]); //
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

async function checkThing(owner, objects) {
	owner = await Team.findById(owner);
	for (const el of objects) {
		if (el.team._id !== owner._id.toHexString()) {
			throw Error(`${el.name} DOES NOT belongs to ${owner.shortName}!`);
		}
		else {
			console.log(`${el.name} belongs to ${owner.shortName}!`);
		}
	}
	return true;
}

async function resolveOffer(senderOffer, senderTeam, opposingTeam) {
	let modified = [];
	// case "megabucks":
	routeDebugger('Working on Megabucks');
	if (senderOffer.megabucks > 0) {
		try{
			const accountFrom = await Account.findOne({ 'team' : senderTeam, 'name' : 'Treasury' });
			const accountTo = await Account.findOne({ 'team' : opposingTeam, 'name' : 'Treasury' });
			modified.push(await accountFrom.withdrawal({ resource: 'Megabucks', amount: senderOffer.megabucks, note: `Trade with ${opposingTeam.shortName}` }));
			modified.push(await accountTo.deposit({ resource: 'Megabucks', amount: senderOffer.megabucks, note: `Trade with ${senderTeam.shortName}` }));
		}
		catch(err) {
			console.log(`ERROR WITH MEGABUCK TRADE: ${err}`);
		}

	}

	// case "aircraft" :
	for await (const plane of senderOffer.aircraft) {
		routeDebugger('Working on Aircraft Transfer');
		const aircraft = await Aircraft.findById(plane._id);
		aircraft.team = opposingTeam; // change the aircraft's team
		exchangeUpgrade(aircraft.upgrades, opposingTeam); // change the aircraft's Upgrade
		await aircraft.save();
		modified.push(aircraft);
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
	// console.log(modified);
	nexusEvent.emit('request', 'update', modified); //
}

module.exports = { resolveTrade, createTrade, trashTrade, editTrade, approveTrade, rejectTrade };