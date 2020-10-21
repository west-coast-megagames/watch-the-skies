const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

// Log Model - Using Mongoose Model
const { Log } = require('../../models/logs/log');

// @route   GET api/log
// @Desc    Get all logs
// @access  Public
router.get('/', async function (req, res) {
	routeDebugger('Sending the logs!');
	const logs = await Log.find()
		.populate('team')
		.populate('country', 'name')
		.populate('zone')
		.populate('project')
		.populate('lab')
		.populate('theory')
		.populate('units')
		.sort({ date: 1 });
	res.status(200).json(logs);
});

// @route   PATCH api/log/deleteAll
// @desc    Delete All Logs
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Log.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Logs!`);
});

module.exports = router;