const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResearchSchema = new Schema({
    model: { type: String, default: 'Research'},
    name: { type: String },
    code: {type: String},
    level: { type: Number },
    prereq: [String],
    desc: { type: String },
    unlocks: [String]
});

module.exports = Log = mongoose.model('Research', ResearchSchema, 'research');