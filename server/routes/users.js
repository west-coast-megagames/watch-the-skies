const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

// User Model - Using Mongoose Model
const { User, validateUser } = require('../models/user');
const { Team } = require('../models/team');

// @route   POST /user
// @Desc    Post a new User
// @access  Public
router.post('/', async function (req, res) {
    console.log('Someone is trying to make a user...', req.body)
    let userIn = req.body;
    let { username, email } = req.body;

    const test1 = validateUser(req.body);
    if (test1.error) return res.status(400).send(`User Val Error: ${test1.error.details[0].message}`);

    let user = await User.findOne({ email })
    if (user) {
        console.log(`User with the email: ${email} already registered...`);
        return res.status(400).send(`User with the email: ${email} already registered...`);
    } else {
        let user = new User(userIn);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        const token = user.generateAuthToken();
        
        if (req.body.teamCode != ""){
          let team = await Team.findOne({ teamCode: req.body.teamCode });  
          if (!team) {
            console.log("User Post Team Error, New User:", req.body.username, " Team: ", req.body.teamCode);
          } else {
            user.team.team_id  = team._id;
            user.team.teamName = team.shortName;
            user.team.teamCode = team.teamCode;
          }
        }

        user = await user.save();
        let sendUser = {
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
    if (users != null) {
      console.log(`Verifying ${user.username}`);
      res.json(user);
    } else {
      res.status(404).send(`The User with the ID ${id} was not found!`);
    }
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
router.get('/id/:id', validateObjectId, async (req, res) => {
    
    let id = req.params.id;

    const users = await User.findById(id);
    if (users != null) {
      res.json(users);
    } else {
      res.status(404).send(`The User with the ID ${id} was not found!`);
    }
  });

// @route   PUT users/id
// @Desc    Update Existing User
// @access  Public  
router.put('/:id', validateObjectId, async (req, res) => {
    const { error } = validateUser(req.body); 
    if (error) {       
      return res.status(400).send(error.details[0].message);
    } 
  
    const user = await User.findByIdAndUpdate(req.params.id, 
      { username: req.body.username,
        email: req.body.email, 
        phone: req.body.phone, 
        gender: req.body.gender,
        dob: new Date(req.body.dob),
        discord: req.body.discord 
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
      let id = user.id;
      try {
        userDel = await User.findByIdAndRemove(id);
        if (userDel = null) {
          res.status(404).send(`The User with the ID ${id} was not found!`);
        }
      } catch (err) {
        console.log('DeleteAll User Error:', err.message);
        res.status(400).send(err.message);
      }
    }        
    res.status(200).send("All Users succesfully deleted!");
  });

module.exports = router;