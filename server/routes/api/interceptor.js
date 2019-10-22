const express = require('express');
const router = express.Router();

// Interceptor Model - Using Mongoose Model
const Interceptor = require('../../models/interceptor');

// @route   GET api/interceptor
// @Desc    Get all Interceptors
// @access  Public
router.get('/', (req, res) => {
    console.log('Sending interceptors somewhere...');
    Interceptor.find()
        .sort({team: 1})
        .then(interceptors => res.json(interceptors));
});

// @route   GET api/interceptor
// @Desc    Get all Interceptors
// @access  Public
router.get('/contacts', (req, res) => {
    console.log('Getting radar contacts...');
    Interceptor.find()
        .sort({team: 0})
        .then(interceptors => res.json(interceptors));
});

// @route   POST api/interceptor
// @Desc    Post a new interceptor
// @access  Public
router.post('/', (req, res) => {
    let { designation, team, location, stats } = req.body;
    const newInterceptor = new Interceptor(
        { designation, team, location, stats }
    );

    Interceptor.find({ designation }, (err, docs) => {
        if (!docs.length){
            newInterceptor.save()
            .then(interceptor => res.json(interceptor)) 
            .then(() => console.log(`Interceptor ${req.body.designation} created...`));
        } else {                
            console.log(`Interceptor exists: ${designation}`);
            res.send(`Interceptor ${designation} exists!`);
        }
    });
});

// @route   PUT api/interceptor/:id
// @Desc    Update an interceptor
// @access  Public
router.put('/:id', (req, res) => {
    let { designation } = req.body;
    const interceptor = Interceptor.findById(req.params.id);

    interceptor.update({ designation })
    .then(interceptor => res.json(interceptor))
    .then(() => console.log(`Interceptor ${req.params.id} updated...`))
    .then(() => console.log(`Interceptor named ${req.body.designation}...`));
});

// @route   GET api/interceptor/resethull
// @desc    Update all interceptors to max health
// @access  Public
router.get('/resethull', (req, res) => {
    resetHull();

    res.send("Interceptors succesfully reset!");
});

async function resetHull() {
    for await (const interceptor of Interceptor.find()) {    
        console.log(`${interceptor.designation} has ${interceptor.stats.hull} hull points`);
        interceptor.stats.hull = interceptor.stats.hullMax;
        console.log(`${interceptor.designation} now has ${interceptor.stats.hull} hull points`);
        
        await interceptor.save();
    }
};

module.exports = router;