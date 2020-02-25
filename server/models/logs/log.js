const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    timestamp: {
        date: { type: Date, default: Date.now() },
        turn: { type: String },
        phase: { type: String },
        turnNum: { type: Number },
        clock: { type: String } 
    },
    model: { type: String, default: 'Log'},
    team: { type: Schema.Types.ObjectId, ref: 'Team'}
});

module.exports = Log = mongoose.model('log', LogSchema);