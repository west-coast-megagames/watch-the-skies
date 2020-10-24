const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server
const bcrypt = require('bcryptjs');

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { User } = require('../../models/user');

// @route   GET /user
// @Desc    Get all Users
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/user requested...');

	try {
		const users = await User.find()
			.populate('team', 'name shortName');
		res.status(200).json(users);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET /user/:id
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

// @route   POST /user
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
	logger.info('POST Route: api/user call made...');
	let newUser = new User(req.body);
	const { email, username } = req.body;

	try {
		await newUser.validateUser();

		const docs = await User.find({ email });

		if (docs.length < 1) {
			const salt = await bcrypt.genSalt(10);
			newUser.password = await bcrypt.hash(newUser.password, salt);

			const token = newUser.generateAuthToken();
			newUser = await newUser.save();

			logger.info(`User ${username} created...`);

			const sendUser = {
				_id: newUser._id,
				email: newUser.email,
				name: `${newUser.name.first} ${newUser.name.last}`,
				username
			};
			res.status(200)
				.header('x-auth-token', token)
				.header('access-control-expose-headers', 'x-auth-token')
				.json(sendUser);
		}
		else {
			logger.info(`User with the email: ${email} already registered...`);
			nexusError(`User with the email: ${email} already registered...`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/user/:id
// @Desc    Delete one user
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/user/:id call made...');
	const id = req.params.id;

	try {
		const user = await User.findByIdAndRemove(id);

		if (user != null) {
			logger.info(`The user with the id ${id} was deleted!`);
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

// @route   PATCH /users/deleteAll
// @desc    Delete All Users
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await User.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Users!`);
});

module.exports = router;