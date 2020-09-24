const { LogInfo } = require('../../models/log/logInfo');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const validateObjectId = require('../../middleware/util/validateObjectId');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// @route   GET api/logInfo
// @Desc    Get all logInfo
// @access  Public
router.get('/', async (req, res) => {
	const logInfo = await LogInfo.find().sort('timestamp');
	res.json(logInfo);
});

// @route   GET api/logInfo/id
// @Desc    Get logInfo by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	const logInfo = await LogInfo.findById(id).sort('timestamp');

	if (logInfo != null) {
		res.json(logInfo);
	}
	else {
		res.status(404).send(`The LogInfo with the ID ${id} was not found!`);
	}
});


// @route   PATCH api/logInfos/deleteAll
// @desc    Delete All LogInfos
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	for await (const logInfo of LogInfo.find()) {
		const id = logInfo.id;
		try {
			const logInfoDel = await LogInfo.findByIdAndRemove(id);
			if (logInfoDel === null) {
				res.status(404).send(`The LogInfo with the ID ${id} was not found!`);
			}
		}
		catch (err) {
			console.log('Error:', err.message);
			res.status(400).send(err.message);
		}
	}
	res.status(200).send('All LogInfos succesfully deleted!');
});

module.exports = router;