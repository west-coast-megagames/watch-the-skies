const bankDebugging = require('debug')('app:bankingSystem');
const { Team } = require('../../../models/team')

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
    bankDebugging(`Current amount in ${account}: ${accounts[accountIndex].balance}`);
    newAccounts[accountIndex].balance += parseInt(amount);

    bankDebugging(`${amount} deposited into ${account}.`);
    bankDebugging(`Reason: ${note}`);

    // Create Deposit log

    return newAccounts;
};

function withdrawl (accounts, account, amount, note) {
    let newAccounts = accounts;
    let accountIndex = accounts.findIndex((obj => obj.name === account));
    bankDebugging(`Attempting to withdrawl from ${account}.`);
    bankDebugging(`Current amount in ${account}: ${accounts[accountIndex].balance}`);

    newAccounts[accountIndex].balance -= parseInt(amount);

    bankDebugging(`${amount} witdrawn from ${account}.`);
    bankDebugging(`Reason: ${note}`);

    // Create Withdrawl log

    return newAccounts;
};

module.exports = {
    transfer,
    deposit,
    withdrawl
};