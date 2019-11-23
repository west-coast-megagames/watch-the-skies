const bankDebugging = require('debug')('app:bankingSystem');
const { Team } = require('../../../models/team');
const alerts = require('../notifications/alerts');
const transactionLog = require('../../../models/logs/transactionLog')

let autoTranfers = [];

async function transfer (teamID, to, from, amount, note) {   
    try {
        let team = await Team.findOne({ _id: teamID });
        let { accounts, name, teamCode } = team;

        bankDebugging(`${team.name} has initiated a transfer!`);

        accounts = withdrawl(teamID, name, accounts, from, amount, note);
        accounts = deposit(teamID, name, accounts, to, amount, note);

        bankDebugging(`Saving ${team.name} object...`);
        team = await team.save();
        bankDebugging(team.accounts);
        bankDebugging(`${team.name} transfer completed!`)

        return team.accounts;
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }    
};

function deposit (teamID, team, accounts, account, amount, note) {
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
    try {
        let team = await Team.findOne({ _id: teamID });
        bankDebugging(`${team.name} is setting up an automatic payment!`);

        let newTransfer = [{ teamID, to, from, amount, note }];

        autoTranfers = [...autoTranfers, ...newTransfer];

        return `New autotransfer created`;
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }    
};

function automaticTransfer() {
    for (let autoTransfer of autoTranfers) {
        let { teamID, to, from, amount, note } = autoTransfer;
        
        transfer(teamID, to, from, amount, note);
    }
}

module.exports = {
    transfer,
    deposit,
    withdrawl,
    setAutoTransfer,
    automaticTransfer
};