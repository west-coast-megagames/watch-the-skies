const SocketServer = require('../../util/systems/socketServer'); // Client Tracking Object
const nexusEvent = require('../../middleware/events/events'); // Local event triggers
const socketDebugger = require('debug')('app:sockets:update');
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling

// Mongoose Object Models & Methods
const { getTeam } = require('../../models/team');
const { Aircraft } = require('../../models/aircraft');
const { Account } = require('../../models/account');
const { Article } = require('../../models/article');
const { Research } = require('../../models/research');
const { Facility } = require('../../models/facility');
const { Military } = require('../../models/military');
const { Site } = require('../../models/site');
const { Upgrade } = require('../../models/upgrade');
const { Report } = require('../../models/report');

module.exports = function (io) {
	const UpdateClients = new SocketServer();

	const updateSocket = io.of('/update').on('connection', (client) => {
		logger.info(`New client subscribing to update socket... ${client.id}`);
		UpdateClients.connections.push(client);
		logger.info(
			`${UpdateClients.connections.length} ${
				UpdateClients.connections.length === 1 ? 'client' : 'clients'
			} subscribed to update service...`
		);
		client.emit('updateUsers', UpdateClients.getUsers());

		client.on('new user', (data) => {
			UpdateClients.saveUser(data, client);
			logger.info(
				`${data.user} for the ${data.team} have been registered as gameclock subscribers...`
			);
			socketDebugger('Sending socket new users');
			client.broadcast.emit('updateUsers', UpdateClients.getUsers());
			updateSocket.to(client.id).emit('login', {
				me: { ...data, id: client.id },
				userList: UpdateClients.getUsers()
			});
			socketDebugger('New users sent!');
		});

		client.on('disconnect', () => {
			logger.info(`Client disconnecting from update service... ${client.id}`);
			UpdateClients.delClient(client);
			console.log(`${UpdateClients.connections.length} clients connected`);
			client.broadcast.emit('updateUsers', UpdateClients.getUsers());
		});
	});

	nexusEvent.on('updateAccounts', async () => {
		const accounts = await Account.find()
			.sort({ team: 1 })
			.populate('team', 'name shortName');
		socketDebugger('Updating financial accounts...');
		updateSocket.emit('updateAccounts', accounts);
	});

	nexusEvent.on('updateAircrafts', async () => {
		socketDebugger('Updating aircraft socket event!');
		const aircrafts = await Aircraft.find()
			.sort({ team: 1 })
			.populate('team', 'name shortName code')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('site', 'name geoDecimal')
			.populate('origin', 'name');
		socketDebugger('Updating aircrafts...');
		updateSocket.emit('currentAircrafts', aircrafts);
		socketDebugger('Updating aircraft socket event sent!');
	});

	nexusEvent.on('updateTeam', async (team_id) => {
		socketDebugger('Event: Team update needed...');
		const team = await getTeam(team_id);
		updateSocket.emit('teamUpdate', team);
	});

	nexusEvent.on('updateResearch', async () => {
		socketDebugger('Event: Updating research...');
		const research = await Research.find().sort({ level: 1 }).sort({ field: 1 });
		updateSocket.emit('updateResearch', research);
	});

	nexusEvent.on('updateFacilities', async () => {
		socketDebugger('Event: Updating facilities...');
		const facilities = await Facility.find()
			.populate('site', 'name type')
			.populate('team', 'shortName name')
			.populate('research')
			.populate('upgrade');
		updateSocket.emit('updateFacilities', facilities);
	});

	nexusEvent.on('updateMilitary', async () => {
		socketDebugger('Event: Updating Military...');
		const military = await Military.find()
			.sort({ team: 1 })
			.populate('team', 'name shortName code')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('gear', 'name category')
			.populate('site', 'name geoDecimal')
			.populate('upgrades', 'name effects')
			.populate('origin');
		updateSocket.emit('updateMilitary', military);
	});

	nexusEvent.on('updateReports', async () => {
		socketDebugger('Event: Updating reports...');
		const reports = await Report.find()
			.populate('team')
			.populate('country', 'name')
			.populate('zone')
			.populate('project')
			.populate('lab')
			.populate('theory')
			.populate('units')
			.populate('site', 'name team')
			.sort({ date: 1 });
		updateSocket.emit('updateReports', reports);
	});

	nexusEvent.on('newsAlert', async (article) => {
		try {
			const newArticle = await Article.findById(article._id)
				.populate('publisher', 'name shortName')
				.populate('location', 'name dateline')
				.sort('date: 1');
			updateSocket.emit('newsAlert', newArticle);
			socketDebugger(`News alert sent: ${article.headline}`);
		}
		catch (error) {
			socketDebugger(`Error: ${error.message}`);
		}
	});

	nexusEvent.on('updateSites', async () => {
		socketDebugger('Event: Updating Sites...');
		const sites = await Site.find()
			.populate('country', 'name')
			.populate('team', 'shortName name')
			.populate('facilities', 'name type')
			.populate('zone', 'model name code')
			.sort({ name: -1 });
		updateSocket.emit('updateSites', sites);
	});


	nexusEvent.on('updateUpgrades', async () => {
		socketDebugger('Event: Updating Upgrades...');
		const upgrades = await Upgrade.find();
		updateSocket.emit('updateUpgrades', upgrades);
	});

	nexusEvent.on('error', async (err) => {
		// something here? I don't get how your sockets work.
		console.log(err);
		// it does log so that works.
	});
};
