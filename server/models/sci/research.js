const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UnlockSchema = new Schema({
    code: { type: String },
    type: { type: String }
  });

const BreakthroughSchema = new Schema({
  code: { type: String },
  type: { type: String }
});

const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science', 'Physics', 'Psychology', 'Social Science', 'Quantum Mechanics']

const ProgressSchema = new Schema({
    team: { type: Schema.Types.ObjectId, ref: 'Team'},
    progress: { type: Number, default: 0 }
});

const ResearchSchema = new Schema({
    model: { type: String, default: 'Research'},
    name: { type: String},
    code: {type: String },
    level: { type: Number },
    progress: { type: Number, default: 0},
    prereq: [UnlockSchema],
    desc: { type: String },
    unlocks: [UnlockSchema],
    breakthrough: [BreakthroughSchema]
});

let Research = mongoose.model('Research', ResearchSchema, 'research');

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

module.exports = { Research, KnowledgeResearch };