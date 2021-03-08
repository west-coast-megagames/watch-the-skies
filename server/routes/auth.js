const bcrypt = require('bcryptjs');
const express = require('express');
const { logger } = require('../middleware/log/winston');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');

const { User } = require('../models/user');

// @route   POST /user
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
	const { password, login } = req.body;
	console.log(`${login} is attempting to log in...`);

	let user = await User.findOne({ email: login }).populate('team');
	if (!user) user = await User.findOne({ username: login }).populate('team');
	if (!user) {
		logger.info(`User ${login} doesn't exist in DB...`);
		return res.status(400).send('Invalid login or password');
	}

	const validPassword = await bcrypt.compare(password, user.password);
	if (!validPassword) {
		logger.info(`${login} used an invalid password...`);
		return res.status(400).send('Invalid login or password');
	}

	const token = user.generateAuthToken();
	res.status(200).send(token);
});

router.post('/tokenLogin', async function (req, res) {
	try {
		const decoded = jwt.verify(req.body.token, config.get('jwtPrivateKey'), { maxAge: '2w' });

		let user = await User.findById(decoded._id).populate('team');

		console.log('Issuing new Token');
		user.lastLogin = new Date;
		user = await user.save();
		const token = user.generateAuthToken();
		console.log(token);
		res.status(200).send(token);
	}
	catch(err) {
		if (err.name === 'TokenExpiredError') {
			res.status(401).send(`${err.name}: ${err.message}`);
		}
		else {
			res.status(500).send('Server Error');
		}
	}
});

module.exports = router;