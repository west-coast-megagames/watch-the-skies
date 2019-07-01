const express = require('express');
const router = express.Router();

// Item Model
const Interceptor = require('../../models/interceptor');

// @route   GET api/items
// @Desc    Get all Items
// @access  Public
router.get('/', (req, res) => {
    Interceptor.find()
        .sort({team: 1})
        .then(interceptors => res.json(interceptors));
});


// @route   POST api/items
// @Desc    Get all Items
// @access  Public
router.post('/', (req, res) => {
    const newInterceptor = new Interceptor({
        designation: req.body.designation,
        team: req.body.team,
        location: req.body.location
    });

    newInterceptor.save()
        .then(interceptor => res.json(interceptor))
        .then(() => console.log(`Interceptor ${req.body.designation} created...`))
});

module.exports = router;