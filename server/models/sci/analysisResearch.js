const mongoose = require('mongoose');
const Research = require('../sci/research');
const Schema = mongoose.Schema;


const AnalysisResearch = Research.discriminator('AnalysisResearch', new Schema({
    type: { type: String, default: 'Analysis' },
    team: { type: Schema.Types.ObjectId, ref: 'Team'},
    salvage: [{
        gear: { type: Schema.Types.ObjectId, ref: 'Equipment'},
        system: { type: Schema.Types.ObjectId, ref: 'Equipment'},
        infrastructure: { type: Schema.Types.ObjectId, ref: 'Equipment'},
        facility: { type: Schema.Types.ObjectId, ref: 'Facility'},
        site: { type: Schema.Types.ObjectId, ref: 'Site'},
        outcome: { type: String, enum: ['Destroy', 'Damage', 'Kill', 'Perserve']}
    }],
    progress: { type: Number },
    status: {
        available: { type: Boolean },
        completed: { type: Boolean }
    }
}));

module.exports = AnalysisResearch;