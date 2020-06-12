const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlertSchema = new Schema({
    timestamp: {
        date: { type: Date, default: Date.now() },
        turn: { type: String },
        phase: { type: String },
        turnNum: { type: Number }
    },
    team_id: { type: String },
    teamName: { type: String },
    title: { type: String },
    body: { type: String }
});

module.exports = Alert = mongoose.model('Alert', AlertSchema);