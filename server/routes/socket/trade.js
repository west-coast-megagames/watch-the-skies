const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { createTrade, trashTrade, editTrade, approveTrade, rejectTrade } = require('../../wts/trades/trade');

module.exports = async function (client, req) {
	logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
	let message;
	switch(req.action) {
	case 'new': {
		message = await createTrade(req.data);
		break;
	}
	case 'approve': {
		message = await approveTrade(req.data);
		break;
	}
	case 'edit': {
		message = await editTrade(req.data);
		break;
	}
	case 'reject': {
		message = await rejectTrade(req.data);
		break;
	}
	case 'trash': {
		message = await trashTrade(req.data);
		break;
	}
	default:
		message = `No ${req.action} is in the ${req.route} route.`;
		client.emit('alert', { type: 'error', message });
		throw new Error(message);
	}
};