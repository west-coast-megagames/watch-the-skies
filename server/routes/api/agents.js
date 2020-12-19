const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const validateObjectId = require('../../middleware/util/validateObjectId');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging

// Agent Model - Using Mongoose Model
const { Agent } = require('../../models/agent'); // Agent Model
const { Team } = require('../../models/team'); // WTS Team Model
const { Upgrade } = require('../../models/upgrade');
const httpErrorHandler = require('../../middleware/util/httpError');
const nexusError = require('../../middleware/util/throwError');

// @route   GET api/agents
// @Desc    Get all agents
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/agent requested...');
	try {
		const agents = await Agent.find()
			.sort({ team: 1 })
			.populate('team', 'name shortName code')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('site', 'name geoDecimal')
			.populate('origin', 'name');
		res.status(200).json(agents);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/agents/:id
// @Desc    Get a single agent by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/aircraft/:id requested...');
	const id = req.params.id;
	try {
		const aircraft = await Agent.findById(id)
			.sort({ team: 1 })
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('systems', 'name category')
			.populate('site', 'name');
		if (aircraft != null) {
			res.status(200).json(aircraft);
		}
		else {
			nexusError(`The Agent with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/agents
// @Desc    Post a new agent
// @access  Public
router.post('/', async function (req, res) {
	logger.info('POST Route: api/agent call made...');

	try {
		let newAgent = new Agent(req.body);

		// update stats based on any upgrades
		for (const upgId of newAgent.upgrades) {
			const upgrade = await Upgrade.findById(upgId);
			if (upgrade) {
				for (const element of upgrade.effects) {
					switch (element.type) {
					case 'clandestine':
						newAgent.stats.clandestine += element.effect;
						break;
					case 'effectiveness':
						newAgent.stats.effectiveness += element.effect;
						break;
					case 'survivability':
						newAgent.stats.survivability += element.effect;
						break;
					default: break;
					}
				}
			}
		}

		//	await newAgent.validateAgent();
		const docs = await Agent.find({ name: req.body.name, team: req.body.team });

		if (docs.length < 1) {
			newAgent = await newAgent.save();
			await Team.populate(newAgent, { path: 'team', model: 'Team', select: 'name' });
			logger.info(`${newAgent.name} agent created for ${newAgent.team.name} ...`);
			res.status(200).json(newAgent);
		}
		else {
			nexusError(`A agent named ${newAgent.name} already exists for this team!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/agents/:id
// @Desc    Delete an agent
// @access  Public
router.delete('/:id', async function (req, res) {
	logger.info('DEL Route: api/agent:id call made...');
	try {
		const id = req.params.id;
		let agent = await Agent.findById(id);
		if (agent != null) {
			// await agent.stripUpgrades();
			agent = await Agent.findByIdAndDelete(id);
			logger.info(`${agent.name} with the id ${id} was deleted!`);
			res.status(200).send(`${agent.name} with the id ${id} was deleted!`);
		}
		else {
			nexusError(`No agent with the id ${id} exists!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/agents/deleteAll
// @desc    Delete All Agents
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	let airDelCount = 0;
	let upgDelCount = 0;
	for await (const agent of Agent.find()) {
		const id = agent.id;
		// delete attached upgrades
		for (const upgrade of agent.upgrades) {
			try {
				await Upgrade.findByIdAndRemove(upgrade);
				upgDelCount += 1;
			}
			catch (err) {
				nexusError(`${err.message}`, 500);
			}
		}
		try {
			const agentDel = await Agent.findByIdAndRemove(id);
			if (agentDel == null) {
				res.status(404).send(`The Agent with the ID ${id} was not found!`);
			}
			else {
				airDelCount += 1;
			}
		}
		catch (err) {
			nexusError(`${err.message}`, 500);
		}
	}
	return res.status(200).send(`We wiped out ${airDelCount} Agent and ${upgDelCount} Upgrades! `);
});

module.exports = router;
