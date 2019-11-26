const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

// Interceptor Model - Using Mongoose Model
const { Team } = require('../../models/team');

// @route   GET api/team
// @Desc    Get all Teams
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Looking up teams...');
    try {
        let teams = await Team.find().sort({team: 1});
        res.json(teams);
    } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
    }
});

// @route   GET api/team/:id
// @Desc    Get all single team
// @access  Public
router.get('/:id', async function (req, res) {
    routeDebugger('Looking up a team...');
    try {
        let team = await Team.findById({ _id: req.params.id });
        res.json(team);
    } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
    }
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
    try {
        let docs = await Team.find({ name });
        if (!docs.length) {
            let team = await newTeam.save();
            res.json(team);
            console.log(`The ${name} team created...`);
        } else {                
            console.log(`${name} team already exists!`);
            res.status(400).send(`${name} team already exists!`);
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
    }
});

// @route   PUT api/team/roles/:id
// @Desc    Add a role to a team
// @access  Public
router.put('/roles/:id', async function (req, res) {
    let { role } = req.body;
    try {
        let team = await Team.findById({ _id: req.params.id });
        team.roles.push(role);
        team = await team.save();
        res.json(team);
        console.log(`${role.role} added to ${team.name}!`);
    } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
    }
});

// @route   DELETE api/team/:id
// @Desc    Delete a team
// @access  Public
router.delete('/:id', async function (req, res) {
    let id = req.params.id;
    try {
        const team = await team.findByIdAndRemove(id);
        if (team != null) {
            console.log(`${team.name} with the id ${id} was deleted!`);
            res.send(`${team.name} with the id ${id} was deleted!`);
        } else {
            res.send(`No team with the id ${id} exists!`);
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
    }
});

// @route   PATCH api/team/accounts
// @desc    Update all teams to base income and PR
// @access  Public
router.patch('/accounts', async function (req, res) {
    try {
        for await (let team of Team.find()) {
            let { prLevel, accounts, name, prTrack } = team;
            console.log(`${name} | PR: ${prLevel}`);
            console.log(`Resetting ${name}s accounts...`);  
            team.prLevel = 2;
            console.log(`PR Level set to ${prLevel}`);
            for (let account of accounts) {
                account.balance = 0;
            };
            team.accounts = accounts;
            let index = team.accounts.findIndex((obj => obj.name === 'Treasury'));
            team.accounts[index].balance = prTrack[prLevel];
            console.log(`${team.name} | PR: ${team.prLevel} | Treasury: ${team.accounts[index].balance}`);

            await team.save();
            console.log(`${name}s accounts reset...`);  
        };
        res.send("Accounts succesfully reset!");
    } catch (err) {
        console.log('Error:', err.message);
        res.status(400).send(`Error: ${err.message}`);
    };
});

module.exports = router;