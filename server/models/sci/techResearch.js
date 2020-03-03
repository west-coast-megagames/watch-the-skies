const mongoose = require('mongoose');
const Research = require('../sci/research');
const Schema = mongoose.Schema;

const TheorySchema = new Schema({
    name: { type: String },
    level: { type: Number },
    type: { type: String },
    prereq: { type: Object },
    code: { type: String },
    desc: { type: String },
    field: { type: String }
  });
  

const TechResearch = Research.discriminator('TechResearch', new Schema({
    type: { type: String, default: 'Technology' },
    field: { type: String, enum: ['Military', 'Infrastructure', 'Biomedical', 'Agriculture', 'Analysis']},
    team: { type: Schema.Types.ObjectId, ref: 'Team'},
    progress: { type: Number, default: 0 },
    status: {
        visible: { type: Boolean, default: true },
        available: { type: Boolean, default: true },
        completed: { type: Boolean, default: false }
    },
    theoretical: [TheorySchema]
}));

module.exports = TechResearch;