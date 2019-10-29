const express = require('express');
const router = express.Router();

// Interceptor Model - Using Mongoose Model
const User = require('../models/user');

// @route   POST api/interceptor
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
    let { screenname, name, email, password, age, gender } = req.body;
    const newUser = new User(
        { screenname, name, email, password, age, gender }
    );
    try {
        let docs = await User.find({ email })
        if (!docs.length) {
            let user = await newUser.save();
            res.json(user);
            console.log(`User ${screenname} created...`);
        } else {                
            console.log(`User with the email: ${email} already exists...`);
            res.send(`User with the email: ${email} already exists...`);
        }
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

module.exports = router;