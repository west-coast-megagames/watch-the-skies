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

// @route   POST api/banking/account
// @Desc    Post a new account
// @access  Public
router.post('/account', async function (req, res) {
    let { team_id, name, code, balance, deposits, withdrawls, autoTransfers } = req.body;
    const newAccount = new Account(
        { team_id, name, code, balance, deposits, withdrawls, autoTransfers }
    );
    let docs = await Account.find({ team_id, name })
    if (!docs.length) {
        let account = await newAccount.save();
        res.json(account);
        console.log(`${name} account created...`);
    } else {                
        console.log(`${name} account already exists for this team... `);
        res.send(`${name} account already exists for this team... `);
    }
});

// @route   POST api/banking/accounts
// @Desc    Post a new account
// @access  Public
router.post('/accounts', async function (req, res) {
    for (let account in res.body) {
        const newAccount = new Account(
            { account }
        );
        let { team_id, name } = newAccount;
        let docs = await Account.find({ team_id, name })
        if (!docs.length) {
            let account = await newAccount.save();
            res.json(account);
            console.log(`${name} account created...`);
        } else {                
            console.log(`${name} account already exists for this team... `);
            res.send(`${name} account already exists for this team... `);
        }
    }
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

router.put('/accounts', async function (req, res) {
    let { team_id } = req.body;
    routeDebugger('Looking up accounts...');
    let accounts = await Account.find({ team_id })
    res.json(accounts);
});


module.exports = router;