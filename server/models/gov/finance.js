const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const FinancesSchema = new Schema({
  timestamp: { 
    date: { type: Date, default: Date.now() },
    phase: { type: String },
    turn: { type: String },
    turnNum: { type: Number }
  },
  teamID: { type: Schema.Types.ObjectId, ref: 'team' },
  prScore: { type: Number, required: true },
  treasury: { type: Number },
  accounts: {
    governance: {type: Number },
    operations: { type: Number },
    science: { type: Number },
    diplomatic: { type: Number },
    unsc: { type: Number }
  }
});

let Finances = mongoose.model('finances', FinancesSchema);

module.exports = { Finances, createFinance };


async function createFinance(finance, prChange, teamID) {
  const gameClock = require('../../util/systems/gameClock/gameClock');

  let { treasury, accounts } = finance;
  let { prScore, income } = prChange;
  let { turn, phase, turnNum } = gameClock();
  let date = new Date();
  let timestamp = { date, phase, turn, turnNum }
  
  treasury += income;
  
  let newFinances = { timestamp, prScore, treasury, accounts, teamID }

  console.log('Attempting to create finances!')

  try {
    // validate here....

    let finances = await Finances.find({ teamID, turnNum });
    console.log(finances);
    if (!finances.length) {
      finances = new Finances(newFinances);
      finances = await finances.save();
      console.log('Finances Created')
      console.log(finances);
      return finances;
    } else {
      console.log(`Finances for ${turn} already exist for this team...`);
      return `Finances for ${turn} already exist for this team...`;
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
};