const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const UnlockSchema = new Schema({
	code: { type: String },
	type: { type: String }
});

const BreakthroughSchema = new Schema({
	code: { type: String },
	type: { type: String }
});

const fields = [
	'Biology',
	'Computer Science',
	'Electronics',
	'Engineering',
	'Genetics',
	'Material Science',
	'Physics',
	'Psychology',
	'Social Science',
	'Quantum Mechanics'
];

const ProgressSchema = new Schema({
	team: {
		_id: { type: ObjectId, ref: 'Team', required: true },
		name: { type: String, required: true }
	},
	progress: { type: Number, default: 0, required: true },
	funding: { type: Number, default: 0, required: true },
	totalFunding: { type: Number, default: 0, required: true }
});

const ResearchSchema = new Schema({
	model: { type: String, default: 'Research' },
	name: { type: String },
	code: { type: String },
	level: { type: Number },
	progress: { type: Number, default: 0 },
	prereq: [UnlockSchema],
	desc: { type: String },
	unlocks: [UnlockSchema],
	breakthrough: [BreakthroughSchema],
	gameState: [],
	researchHistory: [{ type: ObjectId, ref: 'Log' }]
});

// validateResearch method
ResearchSchema.methods.validateResearch = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = {
		name: Joi.string().min(2).max(50).required()
		// TODO: Add code rules to Joi validation schema
	};

	// TODO: add discriminator validation schemas

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

};

const Research = mongoose.model('Research', ResearchSchema, 'research');

const KnowledgeResearch = Research.discriminator(
	'KnowledgeResearch',
	new Schema({
		type: { type: String, default: 'Knowledge' },
		field: { type: String, enum: fields },
		credit: { type: ObjectId, ref: 'Team' },
		status: {
			pending: { type: Boolean, default: false },
			available: { type: Boolean, default: true },
			completed: { type: Boolean, default: false },
			published: { type: Boolean, default: false }
		},
		teamProgress: [ProgressSchema]
	})
);

const AnalysisResearch = Research.discriminator(
	'AnalysisResearch',
	new Schema({
		type: { type: String, default: 'Analysis' },
		team: { type: ObjectId, ref: 'Team' },
		salvage: [
			{
				gear: { type: ObjectId, ref: 'Upgrade' },
				system: { type: ObjectId, ref: 'Upgrade' },
				infrastructure: { type: ObjectId, ref: 'Upgrade' },
				facility: { type: ObjectId, ref: 'Facility' },
				site: { type: ObjectId, ref: 'Site' },
				outcome: { type: String, enum: ['Destroy', 'Damage', 'Kill', 'Preserve'] }
			}
		],
		status: {
			available: { type: Boolean },
			completed: { type: Boolean }
		}
	})
);

const TheorySchema = new Schema({
	name: { type: String },
	level: { type: Number },
	type: { type: String },
	prereq: [UnlockSchema],
	code: { type: String },
	desc: { type: String },
	field: { type: String }
});

const FieldSchema = new Schema({
	field: { type: String },
	rolls: { type: Number }
});

const TechResearch = Research.discriminator(
	'TechResearch',
	new Schema({
		type: { type: String, default: 'Technology' },
		field: {
			type: String,
			enum: [ 'Military', 'Infrastructure', 'Biomedical', 'Agriculture', 'Analysis', 'Placeholder' ]
		},
		team: { type: ObjectId, ref: 'Team' },
		funding: { type: Number, default: 0 },
		status: {
			visible: { type: Boolean, default: true },
			available: { type: Boolean, default: false },
			completed: { type: Boolean, default: false }

		},
		theoretical: [TheorySchema],
		knowledge: [FieldSchema]
	})
);

module.exports = {
	Research,
	KnowledgeResearch,
	AnalysisResearch,
	TechResearch
};
