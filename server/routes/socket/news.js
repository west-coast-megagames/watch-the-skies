const nexusEvent = require('../../middleware/events/events');
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const masterClock = require('../../wts/gameClock/gameClock');

const { Military } = require('../../models/military');
const { Article } = require('../../models/article');

module.exports = async function (client, req) {
	try {
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		let message;
		switch(req.action) {
		case('react'):
			// Deploy action expects UNITS & ASSSIGNMENT
			try {
				let article = await Article.findById(req.data.id);
				// TODO - Call population method
				let reacted = article.reactions.some(reaction => reaction.user == req.data.user && reaction.emoji == req.data.emoji);
				article = await !reacted ? article.react(req.data.user, req.data.emoji) : article.unreact(req.data.user, req.data.emoji);
				client.emit('alert', { type: 'success', message: `Article got a reaction of ${req.data.emoji}.` });
			}
			catch (error) {
				client.emit('alert', { type: 'error', message: error.message ? error.message : error });
			}
			break;
		default:
			message = `No ${req.action} is in the ${req.route} route.`;
			throw new Error(message);
		}
	}
	catch (error) {
		client.emit('alert', { type: 'error', message: error.message ? error.message : error });
		console.log(error);
	}
};