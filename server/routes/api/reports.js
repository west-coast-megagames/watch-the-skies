const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const validateObjectId = require('../../middleware/util/validateObjectId');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging

// Report Model - Using Mongoose Model
const { Report } = require('../../models/report');
const nexusError = require('../../middleware/util/throwError'); // Custom Error handling for Nexus
const httpErrorHandler = require('../../middleware/util/httpError'); // Custom HTTP error sending for Nexus
const nexusEvent = require('../../middleware/events/events');

// @route   GET api/reports
// @Desc    Get all Reports
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/reports requested...');
	try {
		const reports = await Report.find()
			.populate('team')
			.populate('organization', 'name')
			.populate('zone')
			.populate('project')
			.populate('lab')
			.populate('theory')
			.populate('units')
			.populate('site', 'name team')
			.sort({ date: 1 });
		res.status(200).json(reports);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/report/:id
// @Desc    Get a single report by ID
// @access  Public
router.get('/:id', validateObjectId, async function (req, res) {
	logger.info('GET Route: api/reports/:id requested...');
	try {
		const report = await Report.findById({ _id: req.params.id })
			.populate('team')
			.populate('organization', 'name')
			.populate('zone')
			.populate('project')
			.populate('lab')
			.populate('theory')
			.populate('units');
		if (report != null) {
			res.status(200).json(report);
		}
		else {
			nexusError(`There is no report with the ID ${req.params.id}`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/reports/:id
// @Desc    Delete a report
// @access  Public
router.delete('/:id', validateObjectId, async function (req, res) {
	logger.info('DEL Route: api/reports/:id call made...');
	const id = req.params.id;

	try {
		const report = await Report.findByIdAndRemove(id);
		if (report != null) {
			logger.info(`${report.name} with the id ${id} was deleted!`);
			res.status(200).send(`${report.name} with the id ${id} was deleted!`);
		}
		else {
			nexusError(`No report with the id ${id} exists!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/reports/deleteAll
// @desc    Delete All Logs
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Report.deleteMany();
	console.log(data);
	nexusEvent.emit('updateReports');
	return res.status(200).send(`We wiped out ${data.deletedCount} Logs!`);
});

module.exports = router;