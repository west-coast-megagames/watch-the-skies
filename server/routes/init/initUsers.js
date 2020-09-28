const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { User } = require('../../models/user');

// @route   GET init/initUser/:id
// @Desc    Get users by id
// @access  Public
router.get('/:id', validateObjectId, async function (req, res) {
	logger.info('GET Route: api/user/:id requested...');
	const id = req.params.id;

	try {
		const user = await User.findById(req.user._id).select('username email name')
			.populate('team', 'name shortName');

		if (user != null) {
			logger.info(`Verifying ${user.username}`);
			res.status(200).json(user);
		}
		else {
			nexusError(`The user with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initUsers/username/:username
// @Desc    Get User by username
// @access  Public
router.get('/username/:username', async (req, res) => {
	logger.info('GET Route: init/initUsers/username/:username requested...');
	const username = req.params.username;

	try {
		const user = await User.findOne({ username: username });
		if (user != null) {
			res.status(200).json(user);
		}
		else {
			res.status(200).json({ type: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;