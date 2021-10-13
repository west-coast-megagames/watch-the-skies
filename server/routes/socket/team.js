const nexusEvent = require('../../middleware/events/events');
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const masterClock = require('../../wts/gameClock/gameClock');

const { Team } = require('../../models/team');

module.exports = async function (client, req) {
	try {
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		let message;
		switch(req.action) {
		case('register'):
			try {
				let team = await Team.findById(req.data.team);
				team = await team.assignUsers(req.data.users);
				client.emit('alert', { type: 'success', message: `Assigned ${req.data.users.length} to ${team.shortnName}. (${team.users.length} members on team!).` });
			} catch (error) {
				client.emit('alert', { type: 'error', message: error.message ? error.message : error });
			}
			break;
		default:
			message = `No ${req.action} is in the ${req.route} route.`;
			throw new Error(message);
		}
	} catch (error) {
		client.emit('alert', { type: 'error', message: error.message ? error.message : error });
		console.log(error);
	}
};