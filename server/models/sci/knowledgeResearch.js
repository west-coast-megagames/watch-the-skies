const mongoose = require('mongoose');
const Research = require('../sci/research');
const Schema = mongoose.Schema;

const fields = ['Astrophysics', 'Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science', 'Psychology', 'Social Science', 'Theoretical Physics']

const KnowledgeResearch = Research.discriminator('KnowledgeResearch', new Schema({
    type: { type: String, default: 'Knowledge' },
    field: { type: String, enum: fields },
    team_id: { type: Schema.Types.ObjectId, ref: 'Team'},
    status: {
        progress: { type: Number },
        available: { type: Boolean },
        completed: { type: Boolean },
        published: { type: Boolean }
    }
}));

module.exports = KnowledgeResearch;