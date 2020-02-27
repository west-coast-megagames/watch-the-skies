const mongoose = require('mongoose');
const Research = require('../sci/research');
const Schema = mongoose.Schema;

const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science', 'Physics', 'Psychology', 'Social Science', 'Quantum Mechanics']

const ProgressSchema = new Schema({
    team: { type: Schema.Types.ObjectId, ref: 'Team'},
    progress: { type: Number, default: 0 }
});

const KnowledgeResearch = Research.discriminator('KnowledgeResearch', new Schema({
    type: { type: String, default: 'Knowledge' },
    field: { type: String, enum: fields },
    credit: { type: Schema.Types.ObjectId, ref: 'Team'},
    status: {
        available: { type: Boolean, default: true },
        completed: { type: Boolean, default: false },
        published: { type: Boolean, default: false }
    },
    teamProgress: [ProgressSchema]
}));

module.exports = KnowledgeResearch;