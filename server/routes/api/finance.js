const express = require('express');
const router = express.Router();

// Finance Model - Using Mongoose Model
const { Finance, createFinance } = require('../../models/gov/finance');

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