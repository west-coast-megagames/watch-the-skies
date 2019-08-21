const express = require('express');
const router = express.Router();

// Item Model
const Interceptor = require('../../models/interceptor');

// @route   GET api/interceptor
// @Desc    Get all Interceptors
// @access  Public
router.get('/', (req, res) => {
    Interceptor.find()
        .sort({team: 1})
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

    newInterceptor.save()
        .then(interceptor => res.json(interceptor)) 
        .then(() => console.log(`Interceptor ${req.body.designation} created...`))
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
    .then(() => console.log(`Interceptor named ${req.body.designation}...`))
});

module.exports = router;