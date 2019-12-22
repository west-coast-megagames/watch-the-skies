const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

const { logger } = require('../../middleware/winston');

// Interceptor Model - Using Mongoose Model
const { Team } = require('../../models/team');

// @route   GET api/team
// @Desc    Get all Teams
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up teams...');
    let teams = await Team.find().sort({team: 1});
    teams = teams.filter( t => t.teamType === 'N')
    res.json(teams);
});

// @route   GET api/team/:id
// @Desc    Get all single team
// @access  Public
router.get('/:id', async function (req, res) {
    routeDebugger('Looking up a team...');
    let team = await Team.findById({ _id: req.params.id });
    res.json(team);
});

// @route   POST api/team
// @Desc    Post a new team
// @access  Public
router.post('/', async function (req, res) {
    let { name, countryID, roles, prTrack, prLevel, accounts } = req.body;
    const { error } = validateTeam(req.body);
        if (error) return res.status(400).send(error.details[0].message);

    const newTeam = new Team(
        { name, countryID, roles, prTrack, prLevel, accounts }
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
router.put('/roles/:id', async function (req, res) {
    let { role } = req.body;
    let team = await Team.findById({ _id: req.params.id });
    team.roles.push(role);
    team = await team.save();
    res.json(team);
    console.log(`${role.role} added to ${team.name}!`);
});

// @route   DELETE api/team/:id
// @Desc    Delete a team
// @access  Public
router.delete('/:id', async function (req, res) {
    let id = req.params.id;
    const team = await team.findByIdAndRemove(id);
    if (team != null) {
        logger.info(`${team.name} with the id ${id} was deleted!`);
        res.send(`${team.name} with the id ${id} was deleted!`);
    } else {
        res.send(`No team with the id ${id} exists!`);
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