const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SystemSchema = new Schema({
    name: { type: String },
    cost: { type: Number },
    prereq: [{
        type: { type: String},
        name: {type: String}}
    ],
    category: { type: String },
    desc: { type: String },
    stats: {
        hullMax: { type: Number },
        attack: { type: Number },
        penetration: { type: Number },
        armor: { type: Number },
        sheild: { type: Number },
        evade: { type: Number },
        range: { type: Number },
        cargo: { type: Number }
    }
});

let System = mongoose.model('System', SystemSchema);

module.exports = { System };