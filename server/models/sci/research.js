const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UnlockSchema = new Schema({
    code: { type: String },
    type: { type: String }
  });

const ResearchSchema = new Schema({
    model: { type: String, default: 'Research'},
    name: { type: String },
    code: {type: String},
    level: { type: Number },
    prereq: [String],
    desc: { type: String },
    unlocks: [UnlockSchema]
});

module.exports = Log = mongoose.model('Research', ResearchSchema, 'research');