const bankDebugging = require('debug')('app:bankingSystem'); // Debug console log

const alerts = require('../../util/systems/notifications/alerts'); // Alert system [Depreciated]
const transactionLog = require('../../models/logs/transactionLog') // WTS Game log function

const { Team } = require('../../models/team'); // Mongoose Model - Team
const { Interceptor } = require('../../models/ops/interceptor') // Mongoose Model - Interceptor

// FUNCTION - transfer [async]
// IN: Transfer Object { teamID, to, from, amount, note }
// OUT: Modified Accounts Object - From the Team Object
// PROCESS: Takes the Transfer object and initiates the correct Deposit and Withdrawl
async function transfer (teamID, to, from, amount, note) {
        const { Team } = require('../../models/team');

        let team = await Team.findById({ _id: teamID });
        let { accounts, name, teamCode } = team;

        bankDebugging(`${team.name} has initiated a transfer!`);

        accounts = await withdrawl(teamID, name, accounts, from, amount, note);
        accounts = await deposit(teamID, name, accounts, to, amount, note);

        bankDebugging(`Saving ${team.name} information...`);
        team.markModified('accounts');
        team = await team.save();
        bankDebugging(team.accounts);
        bankDebugging(`${team.name} transfer completed!`)

        return team.accounts;
};

function deposit (teamID, team, accounts, account, amount, note) {
    const alerts = require('../../util/systems/notifications/alerts');

    let newAccounts = accounts;
    let accountIndex = accounts.findIndex((obj => obj.name === account));
    bankDebugging(`Attempting to deposit into ${account}.`);
    bankDebugging(`Current amount in ${account}: ${accounts[accountIndex].balance}`);
    newAccounts[accountIndex].balance += parseInt(amount);

    bankDebugging(`${amount} deposited into ${team}'s ${account}.`);
    bankDebugging(`Reason: ${note}`);

    alerts.setAlert({
        teamID,
        title: `${account} Deposit`,
        body: `${amount} deposited into ${account}, for ${note}.`
    });

    let { getTimeRemaining } = require('../gameClock/gameClock')
    let { turn, phase, turnNum } = getTimeRemaining();

    newAccounts[accountIndex] = trackTransaction(newAccounts[accountIndex], amount, 'deposit');

    let log = new transactionLog({
        timestamp: {
            date: Date.now(),
            turn,
            phase,
            turnNum
        },
        teamId: teamID,
        transaction: 'deposit',
        account,
        amount,
        note
    });

    log.save();

    bankDebugging('Deposit log created...')

    return newAccounts;
};

function withdrawl (teamID, team, accounts, account, amount, note) {
    const alerts = require('../../util/systems/notifications/alerts');

    let newAccounts = accounts;
    let accountIndex = accounts.findIndex((obj => obj.name === account));
    bankDebugging(`Attempting to withdrawl from ${account}.`);
    bankDebugging(`Current amount in ${account}: ${accounts[accountIndex].balance}`);

    newAccounts[accountIndex].balance -= parseInt(amount);

    bankDebugging(`${amount} witdrawn from ${team}'s ${account}.`);
    bankDebugging(`Reason: ${note}`);

    alerts.setAlert({
        teamID: teamID,
        title: `${account} Withdrawl`,
        body: `${amount} withdrawn from ${account}, for ${note}.`
    });

    const { getTimeRemaining } = require('../gameClock/gameClock')
    let { turn, phase, turnNum } = getTimeRemaining();

    newAccounts[accountIndex] = trackTransaction(newAccounts[accountIndex], amount, 'withdrawl');
    
    let log = new transactionLog({
        timestamp: {
            date: Date.now(),
            turn,
            phase,
            turnNum
        },
        teamId: teamID,
        transaction: 'withdrawl',
        account,
        amount,
        note
    });

    log.save();

    bankDebugging('Withdrawl log created...')

    return newAccounts;
};

async function setAutoTransfer (teamID, to, from, amount, note) {
        const { Team } = require('../../models/team');
        let team = await Team.findOne({ _id: teamID });
        let transfer = { to, from, amount, note }

        bankDebugging(`${team.name} is setting up an automatic payment!`);
        
        team.transfers.push(transfer);

        await team.save();
        return `New autotransfer created`;
};

async function automaticTransfer() {
    const { Team } = require('../../models/team');
    let teams = await Team.find();
    for (let team of teams) {
        for (let transaction of team.transfers) {
            let { to, from, amount, note } = transaction;
            let { accounts, name, _id } = team;            
            transfer(team._id, to, from, amount, note);
            

            bankDebugging(`${team.name} has initiated a transfer!`);
    
            accounts = await withdrawl(_id, name, accounts, from, amount, note);
            accounts = await deposit(_id, name, accounts, to, amount, note);
        }
        team.markModified('accounts');
        team = await team.save();
    }
};

function trackTransaction(account, amount, type) {
    let { getTimeRemaining } = require('../gameClock/gameClock')
    let { turnNum } = getTimeRemaining();
    amount = parseInt(amount)
    if (type === 'deposit') {
        account.deposits[turnNum] += amount;
    } else if (type === 'withdrawl') {
        account.withdrawls[turnNum] += amount;
    }
    return account;
}

module.exports = {
    transfer,
    deposit,
    withdrawl,
    setAutoTransfer,
    automaticTransfer
};