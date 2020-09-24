const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();

const { User } = require('../models/user');

// @route   POST /user
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
	const { password, login } = req.body;
	console.log(`${login} is attempting to log in...`);

	let user = await User.findOne({ email: login }).populate('team');
	if (!user) user = await User.findOne({ username: login }).populate('team');
	if (!user) return res.status(400).send('Invalid login or password');

	const validPassword = await bcrypt.compare(password, user.password);
	if (!validPassword) return res.status(400).send('Invalid login or password');

	const token = user.generateAuthToken();
	res.status(200).send(token);
});

module.exports = router;