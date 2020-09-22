const express = require('express');
const router = express.Router();
const nexusEvent = require('../../middleware/events/events');
const { Article } = require('../../models/article');
const { Log } = require('../../models/logs/log');

// @route   DELETE game/delete/logs
// @desc    DELETE all LOG files
// @access  Public
router.delete('/logs', async function (req, res) {
	const data = await Log.deleteMany();
	console.log(data);
	nexusEvent.emit('updateLogs');
	res.status(200).send(`We wiped out ${data.deletedCount} records in the Logs Database!`);
});

// @route   PATCH game/delete/articles
// @desc    Delete All Articles
// @access  Public
router.delete('/deleteAll', async function (req, res) {
	const data = await Article.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Articles!`);
});

module.exports = router;

