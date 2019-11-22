const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    timestamp: {
        date: { type: Date, default: Date.now() },
        turn: { type: String },
        phase: { type: String },
        turnNum: { type: Number }
    },
    teamId: { type: String, }
});

module.exports = Log = mongoose.model('log', LogSchema);