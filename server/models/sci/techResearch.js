const mongoose = require('mongoose');
const Research = require('../sci/research');
const Schema = mongoose.Schema;

const TechResearch = Research.discriminator('TechResearch', new Schema({
    type: { type: String, default: 'Technology' },
    catagory: { type: String, enum: ['Military', 'Consumer', 'Infrastructure', 'Medical', 'Agriculture']},
    team_id: { type: Schema.Types.ObjectId, ref: 'Team'},
    status: {
        progress: { type: Number, default: 0 },
        available: { type: Boolean, default: true },
        completed: { type: Boolean, default: false }
    }
}));

module.exports = TechResearch;