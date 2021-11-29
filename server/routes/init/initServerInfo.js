const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const httpErrorHandler = require('../../middleware/util/httpError');
const config = require('config');

// @route   GET init/initServerInfo
// @Desc    Get Server DB
// @access  Public
router.get('/', async (req, res) => {
	// logger.info('GET lean Route initServerInfo requested...');
	try {

		const serverDB = config.get('dbName');
		const dataObj = { serverDB: serverDB };
		res.status(200).json(dataObj);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

module.exports = router;