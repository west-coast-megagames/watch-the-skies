const bankDebugging = require('debug')('app:bankingSystem'); // Debug console log

const transactionLog = require('../../models/logs/transactionLog') // WTS Game log function

const { Team } = require('../../models/team'); // Mongoose Model - Team
const { Interceptor } = require('../../models/ops/interceptor') // Mongoose Model - Interceptor
const nexusEvent = require('../../startup/events'); // Import of server event carrior

// FUNCTION - transfer [async]
// IN: Transfer Object { team_id, to, from, amount, note }
// OUT: Modified Accounts Object - From the Team Object
// PROCESS: Takes the Transfer object and initiates the correct Deposit and withdrawal
async function transfer (to, from, amount, note) {
        const { Account } = require('../../models/gov/account');

        let depositAccount = await Account.findOne({ _id: to });
        console.log(`The account: ${depositAccount}`);
        let withdrawalAccount = await Account.findOne({ _id: from })
        console.log(`The account: ${withdrawalAccount}`);

        bankDebugging(`${withdrawalAccount.owner} has initiated a transfer!`);

        withdrawalAccount = await withdrawal(withdrawalAccount, amount, note);
        depositAccount = await deposit(depositAccount, amount, note);

        nexusEvent.emit('updateAccounts')

        bankDebugging(`${withdrawalAccount.owner}s transfer completed!`)
};

async function deposit (account, amount, note) {
    bankDebugging(`Attempting to deposit into ${account.name}.`);
    bankDebugging(`Current amount in ${account.name}: ${account.balance}`);
    account.balance += parseInt(amount);

    bankDebugging(`${amount} deposited into ${account.owner}'s ${account.name}.`);
    bankDebugging(`Reason: ${note}`);

    let { getTimeRemaining } = require('../gameClock/gameClock')
    let { turn, phase, turnNum } = getTimeRemaining();

    account = trackTransaction(account, amount, 'deposit');

    let log = new transactionLog({
        timestamp: {
            date: Date.now(),
            turn,
            phase,
            turnNum
        },
        team_id: account.team,
        transaction: 'deposit',
        account: account.name,
        amount,
        note
    });

    log.save();
    account = await account.save();

    bankDebugging('Deposit log created...')
    return account;
};

async function withdrawal (account, amount, note) {
    bankDebugging(`Attempting to withdrawal from ${account.name}.`);
    bankDebugging(`Current amount in ${account.name}: ${account.balance}`);

    account.balance -= parseInt(amount);

    bankDebugging(`${amount} witdrawn from ${account.owner}'s ${account.name} account.`);
    bankDebugging(`Reason: ${note}`);

    const { getTimeRemaining } = require('../gameClock/gameClock')
    let { turn, phase, turnNum } = getTimeRemaining();

    account = trackTransaction(account, amount, 'withdrawal');
    
    let log = new transactionLog({
        timestamp: {
            date: Date.now(),
            turn,
            phase,
            turnNum
        },
        team_id: account.team,
        transaction: 'withdrawal',
        account: account.name,
        amount,
        note
    });

    log.save();

    account = await account.save();
    bankDebugging('withdrawal log created...')

    return account;
};

async function setAutoTransfer (to, from, amount, note) {
        const { Account } = require('../../models/gov/account');

        let account = await Account.findOne({ _id: from });
        let transfer = { to, from, amount, note }

        bankDebugging(`${account.owner} is setting up an automatic payment!`);
        
        account.autoTransfers.push(transfer);

        await account.save();
        console.log(`${account.owner} has set up an auto-transfer for ${account.name}`)
        return `New autotransfer created`;
};

async function automaticTransfer() {
    const { Account } = require('../../models/gov/account');

    for (let account of await Account.find()) {
        if (account.autoTransfers.length > 0) {
            let withdrawalAccount = account;
            for (let transfer of account.autoTransfers) {
                if (transfer !== null) {
                    let { to, from, amount, note } = transfer;
                    
                    let depositAccount = await Account.findOne({ _id: to });
                    withdrawalAccount = await Account.findOne({ _id: from })

                    if (amount < withdrawalAccount.balance) {
                        bankDebugging(`${account.owner} has initiated a transfer!`);
            
                        withdrawalAccount = await withdrawal(withdrawalAccount, amount, note);
                        depositAccount = await deposit(depositAccount, amount, note);
        
                        await depositAccount.save();
                    }
                }
            }
            account = await withdrawalAccount.save();
        }
    }
};

function trackTransaction(account, amount, type) {
    let { getTimeRemaining } = require('../gameClock/gameClock')
    let { turnNum } = getTimeRemaining();
    amount = parseInt(amount)
    if (type === 'deposit') {
        account.deposits[turnNum] += amount;
        bankDebugging(`Deposit of ${amount} tracked on the ${account.name} account...`)
        account.markModified('deposits');
    } else if (type === 'withdrawal') {
        account.withdrawals[turnNum] += amount;
        bankDebugging(`Withdrawal of ${amount} tracked on the ${account.name} account...`)
        account.markModified('withdrawals');
    }
    return account;
}

module.exports = {
    transfer,
    deposit,
    withdrawal,
    setAutoTransfer,
    automaticTransfer
};