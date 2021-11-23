const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { Account } = require('../../models/account'); // Account Model

const bankDebugging = require('debug')('sockets:Transactions'); // Debug console log

module.exports = async function (client, req) {
	logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
	let account;
	let message;
	switch(req.action) {
	case('transfer'):
		account = await Account.findById(req.data.from);
		bankDebugging(`${account.owner} has initiated a transfer!`);
		message = await account.transfer(req.data);
		client.emit('alert', { type: 'success', message });
		break;
	case('init'):
		account = await Account.findById(req.data.account);
		message = await account.initResource(req.data.resource);
		client.emit('alert', { type: 'success', message });
		break;
	case('schedule'):
		account.schedule(req.data);
		break;
	default:
		message = `No ${req.action} is in the ${req.route} route.`;
		client.emit('alert', { type: 'error', message });
		throw new Error(message);
	}
};