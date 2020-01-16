const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResearchSchema = new Schema({
    name: { type: String },
    level: { type: Number },
    prereq: [String]
});

module.exports = Log = mongoose.model('research', ResearchSchema, { collection: 'research' });