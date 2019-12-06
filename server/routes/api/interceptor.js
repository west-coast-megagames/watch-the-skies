const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth')

// Interceptor Model - Using Mongoose Model
const { Interceptor } = require('../../models/ops/interceptor');

// @route   GET api/interceptor
// @Desc    Get all Interceptors
// @access  Public
router.get('/', async function (req, res) {
    console.log('Sending interceptors somewhere...');
    let interceptors = await Interceptor.find().sort({team: 1});
    res.json(interceptors);
});

// @route   POST api/interceptor
// @Desc    Post a new interceptor
// @access  Public
router.post('/', async function (req, res) {
    let { designation, team, location, stats } = req.body;
    const newInterceptor = new Interceptor(
        { designation, team, location, stats }
    );
    let docs = await Interceptor.find({ designation })
    if (!docs.length) {
        let interceptor = await newInterceptor.save();
        res.json(interceptor);
        console.log(`Interceptor ${req.body.designation} created...`);
    } else {                
        console.log(`Interceptor already exists: ${designation}`);
        res.send(`Interceptor ${designation} already exists!`);
    }
});

// @route   PUT api/interceptor/:id
// @Desc    Update an interceptor
// @access  Public
router.put('/:id', async function (req, res) {
    let { designation } = req.body;
    const interceptor = await Interceptor.findOneAndUpdate({ _id: req.params.id }, { designation }, { new: true });
    res.json(interceptor);
    console.log(`Interceptor ${req.params.id} updated...`);
    console.log(`Interceptor named ${interceptor.designation}...`);
});

// @route   DELETE api/interceptor/:id
// @Desc    Delete an interceptor
// @access  Public
router.delete('/:id', async function (req, res) {
    let id = req.params.id;
    const interceptor = await Interceptor.findByIdAndRemove(id);
    if (interceptor != null) {
        console.log(`${interceptor.designation} with the id ${id} was deleted!`);
        res.send(`${interceptor.designation} with the id ${id} was deleted!`);
    } else {
        res.send(`No interceptor with the id ${id} exists!`);
    }
});

// @route   PATCH api/interceptor/resethull
// @desc    Update all interceptors to max health
// @access  Public
router.patch('/resethull', auth, async function (req, res) {
    for await (const interceptor of Interceptor.find()) {    
        console.log(`${interceptor.designation} has ${interceptor.stats.hull} hull points`);
        interceptor.stats.hull = interceptor.stats.hullMax;
        interceptor.status.destroyed = false;
        console.log(`${interceptor.designation} now has ${interceptor.stats.hull} hull points`);
        await interceptor.save();
    }
    res.send("Interceptors succesfully reset!");
});

// @route   PATCH api/interceptor/return
// @desc    Update all interceptors to return to base
// @access  Public
router.patch('/return', async function (req, res) {
    for await (const interceptor of Interceptor.find()) {    
        interceptor.status.deployed = false;
        interceptor.status.ready = true;
        interceptor.status.mission = false;
        await interceptor.save();
    }
    res.send("Interceptors succesfully returned!");
});

// @route   PATCH api/interceptor/china
// @desc    Update all interceptors to be deployed
// @access  Public
router.patch('/china', async function (req, res) {
    for await (const interceptor of Interceptor.find({ designation: /PRC/i })) {    
        interceptor.status.deployed = true;
        await interceptor.save();
    }
    res.send("China's interceptor deployed...");
});

module.exports = router;