const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { Account } = require('../../models/account'); // Account Model

const bankDebugging = require('debug')('sockets:Transactions'); // Debug console log

const masterClock = require('../../wts/gameClock/gameClock');

module.exports = async function (client, req) {
	logger.info(`${client.username} has made a ${req.action} request!`);
	let message;
	switch(req.action) {
	case('transfer'):
		let { from, to } = req.data
		let withdrawalAccount = await Account.findOne({ _id: from });
		bankDebugging(`${withdrawalAccount.owner} has initiated a transfer!`);
		withdrawalAccount.withdrawal(req.data);
		
		let depositAccount = await Account.findOne({ _id: to });
		dipositAccount.deposit(req.data);

		bankDebugging(`${withdrawalAccount.owner}s transfer completed!`);
		return;
		break;
	case('schedule'):
		let
	default:
		message = `No ${req.action} is in the ${req.route} route.`;
		client.emit('alert', { type: 'error', message });
		throw new Error(message);
	}
};