const express = require('express');
const router = express.Router();

// Interceptor Model - Using Mongoose Model
const Interceptor = require('../../models/operations/interceptor');

// @route   GET api/interceptor
// @Desc    Get all Interceptors
// @access  Public
router.get('/', async function (req, res) {
    console.log('Sending interceptors somewhere...');
    try {
        let interceptors = await Interceptor.find().sort({team: 1});
        res.json(interceptors);
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

// @route   POST api/interceptor
// @Desc    Post a new interceptor
// @access  Public
router.post('/', async function (req, res) {
    let { designation, team, location, stats } = req.body;
    const newInterceptor = new Interceptor(
        { designation, team, location, stats }
    );
    try {
        let docs = await Interceptor.find({ designation })
        if (!docs.length) {
            let interceptor = await newInterceptor.save();
            res.json(interceptor);
            console.log(`Interceptor ${req.body.designation} created...`);
        } else {                
            console.log(`Interceptor already exists: ${designation}`);
            res.send(`Interceptor ${designation} already exists!`);
        }
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

// @route   PUT api/interceptor/:id
// @Desc    Update an interceptor
// @access  Public
router.put('/:id', async function (req, res) {
    let { designation } = req.body;
    try {
        const interceptor = await Interceptor.findOneAndUpdate({ _id: req.params.id }, { designation }, { new: true });
        res.json(interceptor);
        console.log(`Interceptor ${req.params.id} updated...`);
        console.log(`Interceptor named ${interceptor.designation}...`);
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

// @route   DELETE api/interceptor/:id
// @Desc    Delete an interceptor
// @access  Public
router.delete('/:id', async function (req, res) {
    let id = req.params.id;
    try {
        const interceptor = await Interceptor.findByIdAndRemove(id);
        if (interceptor != null) {
            console.log(`${interceptor.designation} with the id ${id} was deleted!`);
            res.send(`${interceptor.designation} with the id ${id} was deleted!`);
        } else {
            res.send(`No interceptor with the id ${id} exists!`);
        }
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }
});

// @route   PATCH api/interceptor/resethull
// @desc    Update all interceptors to max health
// @access  Public
router.patch('/resethull', async function (req, res) {
    try {
        for await (const interceptor of Interceptor.find()) {    
            console.log(`${interceptor.designation} has ${interceptor.stats.hull} hull points`);
            interceptor.stats.hull = interceptor.stats.hullMax;
            console.log(`${interceptor.designation} now has ${interceptor.stats.hull} hull points`);
            await interceptor.save();
        }
        res.send("Interceptors succesfully reset!");
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    };
});

module.exports = router;