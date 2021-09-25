const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { Account } = require('../../models/account'); // Account Model

const bankDebugging = require('debug')('sockets:Transactions'); // Debug console log

module.exports = async function (client, req) {
	logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);

	const { from } = req.data;
	const account = await Account.findOne({ _id: from });

	let message;
	switch(req.action) {
	case('transfer'):
		bankDebugging(`${account.owner} has initiated a transfer!`);
		account.transfer(req.data);
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