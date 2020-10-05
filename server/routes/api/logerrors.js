const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

// logError Model - Using Mongoose Model
const { LogError } = require('../../models/log/logError');

// @route   GET api/logerrors
// @Desc    Get all logerrors
// @access  Public
router.get('/', async function (req, res) {
	routeDebugger('Sending the logErrors!');
	const logErrors = await LogError.find()
		.sort({ timestamp: 1 });
	res.status(200).json(logErrors);
});

// @route   PATCH api/logerrors/deleteAll
// @desc    Delete All LogErrors
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await LogError.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} LogErrors!`);
});

module.exports = router;