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

const gameClock = require('../../util/systems/gameClock/gameClock')

async function createFinance(finance, teamID) {
  let { prScore, treasury, accounts } = finance;
  let { turn, phase, turnNum } = gameClock();
  let date = new Date();
  let timestamp = { date, phase, turn, turnNum }
  try {
    // validate here....

    let budget = await Finances.find({ teamID, turnNum });
    if (budget) {
        return `Budget for ${turn} already exist for this team...`
    } else {
      budget = new Finances(
        { timestamp, prScore, treasury, accounts, teamID }
      );
      budget = await budget.save();
      console.log(budget);
      return budget;

    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
};