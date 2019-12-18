const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth');

// Interceptor Model - Using Mongoose Model
const { User, validateUser } = require('../models/user');

// @route   POST /user
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
    let { screenname, name, email, password, age, gender, DoB, phone, discord } = req.body;
    DoB = new Date(DoB);

    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    let user = await User.findOne({ email })
    if (user) {
        console.log(`User with the email: ${email} already registered...`);
        return res.status(400).send(`User with the email: ${email} already registered...`);
    } else {
        let user = new User(
            { screenname, name, email, password, age, gender, DoB, phone, discord }
        );

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        const token = user.generateAuthToken();
        
        user = await user.save();
        let sendUser = {
            _id: user._id,
            email: user.email,
            name: `${user.name.first} ${user.name.last}`
        };

        console.log(`User ${screenname} created...`);
        return res.header('x-auth-token', token).json(sendUser);
    }
});

// @route   GET /user
// @Desc    Get all Users
// @access  Public
router.get('/me', auth, async function (req, res) {
    const user = await User.findById(req.user._id).select('screenname email name')
    console.log(`Verifying ${user.screenname}`);
    res.json(user);
});

// @route   GET /user
// @Desc    Get all Users
// @access  Public
router.get('/', async function (req, res) {
    console.log('Getting the users...');
        let users = await User.find();
        res.json(users);
});

// @route   GET /user/id
// @Desc    Get users by id
// @access  Public
router.get('/id/:id', async (req, res) => {
    let id = req.params.id;
    console.log('Jeff here in users/id', id);
    const users = await User.findById(id);
    if (users != null) {
      res.json(users);
    } else {
      res.status(404).send(`The User with the ID ${id} was not found!`);
    }
  });

module.exports = router;