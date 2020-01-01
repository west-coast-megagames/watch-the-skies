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
    for (let account of req.body.accounts) {
        console.log(account)
        let newAccount = new Account(
            account
        );
        let docs = await Account.find({ name: newAccount.name, team_id: newAccount.team_id })
        console.log(docs);
        if (!docs.length) {
            await newAccount.save();
            console.log(`${newAccount.owner} created ${newAccount.name} account...`);
        } else {                
            console.log(`${newAccount.name} account already exists for this team... `);
        }
    }
    return res.status(200).send(`Accounts Created...`);
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
router.patch('/accounts', async function (req, res) {
    for await (let account of Account.find()) {{
            account.balance = 0;
            account.deposits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            account.withdrawals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        };

        await account.save();
        console.log(`${account.owner}'s ${account.name} reset...`);  
    };
    res.send("Accounts succesfully reset!");
});

router.put('/accounts', async function (req, res) {
    let { team_id } = req.body;
    routeDebugger('Looking up accounts...');
    let accounts = await Account.find({ 'team.team_id': team_id })
    res.json(accounts);
});

router.put('/transfer', async function (req, res){
    console.log(req.body)
    let { account_id, transfer_id } = req.body;
    let account = await Account.findOne({ _id: account_id });
    console.log(account.autoTransfers)
    let indexOf = account.autoTransfers.findIndex((t => t._id == transfer_id));
    console.log(indexOf)
    account.autoTransfers.splice(indexOf, 1);
    console.log(account.autoTransfers.length)

    account.markModified('autoTransfers');
    await account.save();
    res.status(200).send('Automatic transfer deleted!');
});

module.exports = router;