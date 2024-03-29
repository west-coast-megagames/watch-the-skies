const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { createTrade, trashTrade, editTrade, approveTrade, rejectTrade } = require('../../wts/trades/trade');

module.exports = async function (client, req) {
	logger.info(`${client.username} has made a ${req.action} request!`);
	let message;
	switch(req.action) {
	case 'newTrade': {
		message = await createTrade(req.data);
		break;
	}
	case 'approveTrade': {
		message = await approveTrade(req.data);
		break;
	}
	case 'editTrade': {
		message = await editTrade(req.data);
		break;
	}
	case 'rejectTrade': {
		message = await rejectTrade(req.data);
		break;
	}
	case 'trashTrade': {
		message = await trashTrade(req.data);
		break;
	}
	default:
		message = `No ${req.action} is in the ${req.route} route.`;
		client.emit('alert', { type: 'error', message });
		throw new Error(message);
	}
};