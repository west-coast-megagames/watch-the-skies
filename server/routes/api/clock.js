const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const masterClock = require('../../wts/gameClock/gameClock');

// @route   GET api/account
// @Desc    Get all Accounts
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/account requested...');
	try {
		const clock = masterClock.getClockState();
		res.status(200).json(clock);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

module.exports = router;