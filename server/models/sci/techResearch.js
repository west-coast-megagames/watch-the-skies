const mongoose = require('mongoose');
const Research = require('../sci/research');
const Schema = mongoose.Schema;

const TechResearch = Research.discriminator('TechResearch', new Schema({
    type: { type: String, default: 'Technology' },
    field: { type: String, enum: ['Military', 'Infrastructure', 'Biomedical', 'Agriculture', 'Analysis']},
    team: { type: Schema.Types.ObjectId, ref: 'Team'},
    progress: { type: Number, default: 0 },
    status: {
        available: { type: Boolean, default: true },
        completed: { type: Boolean, default: false }
    }
}));

module.exports = TechResearch;