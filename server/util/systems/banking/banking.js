const bankDebugging = require('debug')('app:banking');
const Team = require('../../../models/team')

async function transfer (teamID, to, from, amount, note) {    
    try {
        let team = await Team.findOne({ _id: teamID });
        let { accounts } = team;

        bankDebugging(`${team.name} has initiated a transfer!`);

        accounts = withdrawl(accounts, from, amount, note);
        accounts = deposit(accounts, to, amount, note);

        bankDebugging(`Saving ${team.name} object...`);
        team = await team.save();
        bankDebugging(team);
        bankDebugging(`${team.name} transfer completed!`)

        // Create Transfer log

        return team.accounts;
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }    
};

function deposit (accounts, account, amount, note) {
    let newAccounts = accounts;
    let accountIndex = accounts.findIndex((obj => obj.name === account));
    bankDebugging(`Attempting to deposit into ${account}.`);

    newAccounts[accountIndex].balance += amount;

    bankDebugging(`${amount} deposited into ${account}.`);
    bankDebugging(`Reason: ${note}`);

    // Create Deposit log

    return newAccounts;
};

function withdrawl (accounts, account, amount, note) {
    let accountIndex = accounts.findIndex((obj => obj.name === account));

    accounts[accountIndex].balance -= amount;

    bankDebugging(`${amount} witdrawn from ${account}.`);
    bankDebugging(`Reason: ${note}`);

    // Create Withdrawl log

    return accounts;
};

module.exports = {
    transfer,
    deposit,
    withdrawl
};