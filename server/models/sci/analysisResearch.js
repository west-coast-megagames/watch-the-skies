const mongoose = require('mongoose');
const Research = require('../sci/research');
const Schema = mongoose.Schema;


const AnalysisResearch = Research.discriminator('AnalysisResearch', new Schema({
    type: { type: String, default: 'Analysis' },
    team_id: { type: Schema.Types.ObjectId, ref: 'Team'},
    salvage: [{
        name: { type: String },
        type: { type: String },
        outcome: { type: String, enum: ['Destroy', 'Damage', 'Kill', 'Perserve']}
    }],
    status: {
        progress: { type: Number },
        available: { type: Boolean },
        completed: { type: Boolean },
    }
}));

module.exports = AnalysisResearch;