const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SystemSchema = new Schema({
    name: { type: String },
    cost: { type: Number },
    prereq: [{
        type: { type: String},
        name: {type: String}}
    ],
    category: { type: String, enum: [ 'Weapon', 'Engine', 'Sensor', 'Compartment', 'Util', 'Chassis' ] },
    desc: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'Team'},
    creator: { type: Schema.Types.ObjectId, ref: 'Team'},
    stats: {
        hullMax: { type: Number },
        attack: { type: Number },
        penetration: { type: Number },
        armor: { type: Number },
        sheild: { type: Number },
        evade: { type: Number },
        range: { type: Number },
        cargo: { type: Number }
    },
    status: {
        salvage: { type: Boolean, default: false },
        damaged: { type: Boolean, default: false },
    }
});

let System = mongoose.model('System', SystemSchema);

module.exports = { System };