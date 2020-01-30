const bcrypt = require('bcryptjs');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { User } = require('../../models/user');

// @route   POST /user
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
    let { password, login } = req.body;
    console.log(`${login} is attempting to log in...`)
    
    let user = await User.findOne({ email: login }).populate('team',);
    if (!user) user = await User.findOne({ username: login }).populate('team');
    if (!user) return res.status(400).send('Invalid login or password');
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid login or password');

    const token = user.generateAuthToken();
    res.send(token);
});

function validate(req) {
    const schema = {
      username: Joi.string().min(5).max(15).required(),
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(1024).required()
    }
  
    return Joi.validate(user, schema, { "allowUnknown": true });
  }

  module.exports = router;