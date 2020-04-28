const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');
const supportsColor = require('supports-color');

const { logger } = require('../../middleware/winston');

// Interceptor Model - Using Mongoose Model
const { Team, validateTeam, getPR, getTeam, getSciRate, validateRoles } = require('../../models/team/team');

// @route   GET api/team
// @Desc    Get all Teams
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up teams...');
    let teams = await Team.find().sort({team: 1});
    teams = teams.filter( t => t.teamType === 'N')
    res.json(teams);
});

// @route   GET api/team/id/:id
// @Desc    Get all single team
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
  let id = req.params.id;
  const team = await Team.findById(id);
  if (team != null) {
    res.json(team);
  } else {
    res.status(404).send(`The Team with the ID ${id} was not found!`);
  }
});

// @route   GET api/team/code
// @Desc    Get Team by Team Code
// @access  Public
router.get('/code/:teamCode', async (req, res) => {
    let teamCode = req.params.teamCode;
    let team = await Team.find({ teamCode });
    if (team.length) {
      res.json(team);
    } else {
      res.status(404).send(`The Team with the Team Code ${teamCode} was not found!`);
    }
});

// @route   POST api/team
// @Desc    Post a new team
// @access  Public
router.post('/', async (req, res) => {
  let { name, roles, prTrack, prLevel, sciRate, shortName, teamCode, teamType } = req.body;
  const { error } = validateTeam(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (roles){
    if (roles.length > 0) {
      try {
        for (let currRole of roles ) {
          let test2 = validateRoles(currRole);
            if (test2.error) return res.status(400).send(`Team Val Roles Error: ${test2.error.details[0].message}`);
        }
      } catch ( err ) {
        return res.status(400).send(`Team Val Roles Error: ${err.message}`);
      }
    }
  }
  
  const newTeam = new Team(
    { name, roles, prTrack, prLevel, sciRate, shortName, teamCode, teamType }
    );
  let docs = await Team.find({ name });
  if (!docs.length) {
    let team = await newTeam.save();
    res.json(team);
    routeDebugger(`The ${name} team created...`);
  } else {                
    console.log(`${name} team already exists!`);
    res.status(400).send(`${name} team already exists!`);
  }
});

// @route   PUT api/team/roles/:id
// @Desc    Add a role to a team
// @access  Public
router.put('/roles/:id', validateObjectId, async (req, res) => {

    const { error } = validateTeam(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let { role } = req.body;
    try {
      let test2 = validateRoles(role);
      if (test2.error) return res.status(400).send(`Team Val Roles Error: ${test2.error.details[0].message}`);
    } catch ( err ) {
      return res.status(400).send(`Team Val Roles Error: ${err.message}`);
    }

    let team = await Team.findById({ _id: req.params.id });
    team.roles.push(role);

    team = await team.save();
    res.json(team);
    console.log(`${role.role} added to ${team.name}!`);
});

// @route   PUT api/team/id
// @Desc    Update Existing Team
// @access  Public  
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    let id = req.params.id;

    const { error } = validateTeam(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let roles = req.body.roles;
    if (roles) {
      try {
        for (let currRole of roles ) {
          let test2 = validateRoles(currRole);
            if (test2.error) return res.status(400).send(`Team Val Roles Error: ${test2.error.details[0].message}`);
        }
      } catch ( err ) {
        return res.status(400).send(`Team Val Roles Error: ${err.message}`);
      }
    }

    const team = await Team.findByIdAndUpdate( req.params.id,
      { name: req.body.name,
        teamCode: req.body.teamCode,
        shortName: req.body.shortName,
        teamType: req.body.teamType,
        roles: req.body.roles,
        prTrack: req.body.prTrack,
        prLevel: req.body.prLevel,
        sciRate: req.body.sciRate
       }, 
      { new: true, omitUndefined: true }
    );

    if (team != null) {
      res.json(team);
    } else {
      res.status(404).send(`The Team with the ID ${id} was not found!`);
    }
  } catch (err) {
      console.log(`Team Put Error: ${err.message}`);
      res.status(400).send(`Team Put Error: ${err.message}`);
    }
});


// @route   DELETE api/team/:id
// @Desc    Delete a team
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
    let id = req.params.id;
    const team = await Team.findByIdAndRemove(id);
    if (team != null) {
        logger.info(`${team.name} with the id ${id} was deleted!`);
        res.json(team).send(`${team.name} with the id ${id} was deleted!`);
    } else {
      res.status(404).send(`No team with the id ${id} exists!`);
    }
});

// @route   PATCH api/team/pr
// @desc    Update all teams to base PR
// @access  Public
router.patch('/pr', async function (req, res) {
    for await (let team of Team.find()) {
        let { prLevel, name } = team;
        console.log(`${name} | PR: ${prLevel}`);
        console.log(`Resetting ${name}s accounts...`);  
        team.prLevel = 2;
        console.log(`PR Level set to ${prLevel}`);

        console.log(`${team.name} | PR: ${team.prLevel}`);

        await team.save();
        console.log(`${name}s accounts reset...`);  
    };
    res.send("Accounts succesfully reset!");
});

module.exports = router;