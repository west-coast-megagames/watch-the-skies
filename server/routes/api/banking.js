const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

const { logger } = require('../../middleware/winston');

// Interceptor Model - Using Mongoose Model
const { Account } = require('../../models/gov/account');
const { Team } = require('../../models/team');

// @route   GET api/banking/accounts
// @Desc    Get all Accounts
// @access  Public
router.get('/accounts', async function (req, res) {
    routeDebugger('Looking up accounts...');
    let accounts = await Account.find().sort({team_id: 1});
    res.json(accounts);
});

// @route   GET api/banking/accounts/:id
// @Desc    Get a single account by id
// @access  Public
router.get('/accounts/:id', async function (req, res) {
    routeDebugger('Looking up an account...');
    let account = await Account.findById({ _id: req.params.id });
    res.json(account);
});

// @route   PATCH api/banking/accounts
// @desc    Update all teams to base income and PR
// @access  Public
router.patch('/banking/accounts', async function (req, res) {
    for await (let account of accounts.find()) {{
            account.balance = 0;
            account.deposits = [0, 0, 0, 0, 0];
            account.withdrawls = [0, 0, 0, 0, 0];
        };

        if (account.name === 'Treasury') {
            let team = await Team.findById(account.team_id);
            account.balance = team.prTrack[team.prLevel];
        }
        console.log(`${team.name} | PR: ${team.prLevel} | Treasury: ${account.balance}`);

        await account.save();
        console.log(`${team.name} ${account.name} reset...`);  
    };
    res.send("Accounts succesfully reset!");
});

module.exports = router;