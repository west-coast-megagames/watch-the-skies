const mongoose = require('mongoose');
const Research = require('../sci/research');
const Schema = mongoose.Schema;

const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science', 'Physics', 'Psychology', 'Social Science', 'Quantum Mechanics']

const KnowledgeResearch = Research.discriminator('KnowledgeResearch', new Schema({
    type: { type: String, default: 'Knowledge' },
    field: { type: String, enum: fields },
    credit: { type: Schema.Types.ObjectId, ref: 'Team'},
    status: {
        progress: { type: Number, default: 0},
        available: { type: Boolean, default: true },
        completed: { type: Boolean, default: false },
        published: { type: Boolean, default: false }
    }
}));

module.exports = KnowledgeResearch;