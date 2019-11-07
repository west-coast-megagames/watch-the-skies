const express = require('express');
const router = express.Router();

// Interceptor Model - Using Mongoose Model
const { User, validateUser } = require('../models/user');

// @route   POST /user
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
    let { screenname, name, email, password, age, gender, DoB, phone, discord } = req.body;
    DoB = new Date(DoB);
    try {
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

            user = await user.save();
            console.log(`User ${screenname} created...`);
            return res.json(user);            
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
    }
});

// @route   GET /user
// @Desc    Get all Users
// @access  Public
router.get('/', async function (req, res) {
    console.log('Getting the users...');
    try {
        let users = await User.find();
        res.json(users);
    } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
    }
});

module.exports = router;