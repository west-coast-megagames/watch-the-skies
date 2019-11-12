const express = require('express');
const router = express.Router();

// Finance Model - Using Mongoose Model
const { Finances, createFinance } = require('../../models/gov/finance');

// Finance Functions

// @route   PUT api/finances/:id
// @Desc    Create new finance document
// @access  Public
router.put('/finances/:id', async function (req, res) {
    try {
        let team = await createFinance(req.body, req.params.id);
        res.json(team);
    } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
    }
});

router.post('/', async function (req, res) {
    const gameClock = require('../../util/systems/gameClock/gameClock');

    let { prScore, treasury, teamID, accounts } = req.body;
    let { turn, phase, turnNum } = gameClock();
    let date = new Date();
    let timestamp = { date, phase, turn, turnNum }
    
    let newFinances = { timestamp, prScore, treasury, accounts, teamID }
  
    console.log('Attempting to create finances!')
  
    try {
      // validate here....
  
      let finances = await Finances.find({ teamID, 'timestamp.turnNum': turnNum });
      console.log(finances);
      if (!finances.length) {
        finances = new Finances(newFinances);
        finances = await finances.save();
        console.log('Finances Created')
        console.log(finances);
        res.send(finances);
      } else {
        console.log(`Finances for ${turn} already exist for this team...`);
        res.send(`Finances for ${turn} already exist for this team...`);
      }
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
});

// @route   PATCH api/finances/deleteAll
// @desc    Delete All Financial Documents
// @access  Public
router.patch('/deleteAll', async function (req, res) {
  try {
      for await (const doc of Finances.find()) {    
        try {
          const deleteFinance = await Finances.findByIdAndRemove(doc._id);
          if (deleteFinance == null) {
            res.status(404).send(`The financial log with the ID ${id} was not found!`);
          }
        } catch (err) {
          console.log('Error:', err.message);
          res.status(400).send(err.message);
        }
      }  
      res.status(200).send("All financial documents succesfully deleted!");      
  } catch (err) {
      console.log(`Error: ${err.message}`);
      res.status(400).send(`Error: ${err.message}`);
  };
});

module.exports = router;