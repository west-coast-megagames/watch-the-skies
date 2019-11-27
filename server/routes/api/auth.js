const bcrypt = require('bcrypt');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { User } = require('../../models/user');

// @route   POST /user
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
    let { password, email } = req.body;
    
    let user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid E-mail or password');
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid E-mail or password');

    const token = user.generateAuthToken();
    res.send(token);
});

function validate(req) {
    const schema = {
      screenname: Joi.string().min(5).max(15).required(),
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(1024).required()
    }
  
    return Joi.validate(user, schema, { "allowUnknown": true });
  }

  module.exports = router;