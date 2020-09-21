const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const validateObjectId = require('../../middleware/util/validateObjectId');

// User Model - Using Mongoose Model
const { User, validateUser, validateName, validateAddr } = require('../../models/user');
const { Team } = require('../../models/team');

// @route   POST /user
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
	console.log('Someone is trying to make a user...', req.body);
	const userIn = req.body;
	const { username, email } = req.body;

	const test1 = validateUser(req.body);
	if (test1.error) return res.status(400).send(`User Val Error: ${test1.error.details[0].message}`);

	try {
		const test2 = validateName(req.body);
		if (test2.error) return res.status(400).send(`User Val Name Error: ${test2.error.details[0].message}`);
	}
	catch (err) {
		return res.status(400).send(`User Val Name Error: ${err.message}`);
	}

	try {
		const test3 = validateAddr(req.body);
		if (test3.error) return res.status(400).send(`User Val Addr Error: ${test3.error.details[0].message}`);
	}
	catch (err) {
		return res.status(400).send(`User Val Addr Error: ${err.message}`);
	}

	let user = await User.findOne({ email });
	if (user) {
		console.log(`User with the email: ${email} already registered...`);
		return res.status(400).send(`User with the email: ${email} already registered...`);
	}
	else {
		user = new User(userIn);

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);

		const token = user.generateAuthToken();

		if (req.body.teamCode != '') {
			const team = await Team.findOne({ teamCode: req.body.teamCode });
			if (!team) {
				console.log('User Post Team Error, New User:', req.body.username, ' Team: ', req.body.teamCode);
			}
			else {
				user.team = team._id;
			}
		}

		user = await user.save();
		const sendUser = {
			_id: user._id,
			email: user.email,
			name: `${user.name.first} ${user.name.last}`,
			username
		};

		console.log(`User ${username} created...`);
		return res
			.status(200)
			.header('x-auth-token', token)
			.header('access-control-expose-headers', 'x-auth-token')
			.json(sendUser);
	}
});

// @route   GET /user
// @Desc    Get all Users
// @access  Public
router.get('/me', auth, async function (req, res) {
	const user = await User.findById(req.user._id).select('username email name')
		.populate('team', 'name shortName');
	if (user != null) {
		console.log(`Verifying ${user.username}`);
		res.json(user);
	}
	else {
		res.status(404).send(`The User with the ID ${req.user._id} was not found!`);
	}
});

// @route   GET /user
// @Desc    Get all Users
// @access  Public
router.get('/', async function (req, res) {
	console.log('Getting the users...');
	const users = await User.find()
		.populate('team', 'name shortName');
	res.json(users);
});

// @route   GET /user/id
// @Desc    Get users by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {

	const id = req.params.id;

	const users = await User.findById(id)
		.populate('team', 'name shortName');
	if (users != null) {
		res.json(users);
	}
	else {
		res.status(404).send(`The User with the ID ${id} was not found!`);
	}
});

// @route   PUT users/id
// @Desc    Update Existing User
// @access  Public
router.put('/:id', validateObjectId, async (req, res) => {
	const { teamCode } = req.body;
	let newTeam_id;
	const oldUser = await User.findById({ _id: req.params.id });
	if (oldUser !== null) {
		newTeam_id = oldUser.team;
	}

	if (teamCode != '') {
		const team = await Team.findOne({ teamCode: teamCode });
		if (!team) {
			console.log('User Put Team Error, Update Country:', req.body.name, ' Team: ', teamCode);
		}
		else {
			newTeam_id = team._id;
		}
	}
	else {
		newTeam_id = undefined;
	}

	try {
		const test1 = validateUser(req.body);
		if (test1.error) return res.status(400).send(`User Put Val Error: ${test1.error.details[0].message}`);
	}
	catch (err) {
		return res.status(400).send(`User Put Val Error: ${err.message}`);
	}

	try {
		const test2 = validateName(req.body);
		if (test2.error) return res.status(400).send(`User Put Val Name Error: ${test2.error.details[0].message}`);
	}
	catch (err) {
		return res.status(400).send(`User Put Val Name Error: ${err.message}`);
	}

	try {
		const test3 = validateAddr(req.body);
		if (test3.error) return res.status(400).send(`User Put Val Addr Error: ${test3.error.details[0].message}`);
	}
	catch (err) {
		return res.status(400).send(`User Put Val Addr Error: ${err.message}`);
	}

	const user = await User.findByIdAndUpdate(req.params.id,
		{ username: req.body.username,
			email: req.body.email,
			phone: req.body.phone,
			gender: req.body.gender,
			dob: new Date(req.body.dob),
			discord: req.body.discord,
			team: newTeam_id
		},
		{
			new: true,
			omitUndefined: true
		});

	if (!user) return res.status(404).send('The user with the given ID was not found.');

	res.send(user);
});

router.delete('/:id', validateObjectId, async (req, res) => {
	const user = await User.findByIdAndRemove(req.params.id);

	if (!user) return res.status(404).send('The user with the given ID was not found.');

	res.send(user);
});

// @route   PATCH /users/deleteAll
// @desc    Delete All Users
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	for await (const user of User.find()) {
		const id = user.id;
		try {
			const userDel = await User.findByIdAndRemove(id);
			if (userDel === null) {
				res.status(404).send(`The User with the ID ${id} was not found!`);
			}
		}
		catch (err) {
			console.log('DeleteAll User Error:', err.message);
			res.status(400).send(err.message);
		}
	}
	res.status(200).send('All Users succesfully deleted!');
});

module.exports = router;