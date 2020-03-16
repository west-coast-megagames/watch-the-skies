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
  status: {
      available: { type: Boolean },
      completed: { type: Boolean }
  }
}));

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
      available: { type: Boolean, default: false },
      completed: { type: Boolean, default: false }
  },
  theoretical: [TheorySchema]
}));


module.exports = { Research, KnowledgeResearch, AnalysisResearch, TechResearch };