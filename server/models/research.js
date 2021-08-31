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
	name: { type: String,
		required: true,
		index: true,
		minlength: 2,
		maxlength: 50 },
	code: { type: String,
		required: true,
		index: true,
		trim: true,
		minlength: 1,
		maxlength: 40 },
	level: { type: Number },
	progress: { type: Number, default: 0 },
	prereq: [UnlockSchema],
	desc: { type: String },
	unlocks: [UnlockSchema],
	breakthrough: [BreakthroughSchema],
	researchHistory: [{ type: ObjectId, ref: 'Log' }]
});

// validateResearch method
ResearchSchema.methods.validateResearch = async function () {
	const { validTeam, validLog, validUpgrade, validFacility, validSite } = require('../middleware/util/validateDocument');

	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);

	let schema = {};
	switch (this.type) {
	case 'Knowledge':
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			code: Joi.string().min(1).max(40).required(),
			field: Joi.string().valid('Biology',
				'Computer Science',
				'Electronics',
				'Engineering',
				'Genetics',
				'Material Science',
				'Physics',
				'Psychology',
				'Social Science',
				'Quantum Mechanics'),
			teamProgress: Joi.array().items(Joi.object({ 	progress: Joi.number().required(),
				funding: Joi.number().required(),
				totalFunding:	Joi.number().required() }))
		});

		break;

	case 'Analysis':
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			code: Joi.string().min(1).max(40).required(),
			salvage: Joi.array().items(Joi.object({ outcome: Joi.string().valid('Destroy', 'Damage', 'Kill', 'Preserve') }))
		});
		break;

	case 'Technology':
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			code: Joi.string().min(1).max(40).required(),
			field: Joi.string().valid('Military', 'Infrastructure', 'Biomedical', 'Agriculture', 'Analysis', 'Placeholder')
		});
		break;

	default:
		nexusError(`Invalid Type ${this.type} for research!`, 400);

	}

	// used by all types/descriminators
	const mainCheck = schema.validate(this, { allowUnknown: true });
	if (mainCheck.error != undefined) nexusError(`${mainCheck.error}`, 400);

	for await (const rHist of this.researchHistory) {
		await validLog(rHist);
	}

	// Descrininator Validation Schema switch
	switch (this.type) {
	case 'Knowledge':

		if (mainCheck.error != undefined) nexusError(`${mainCheck.error}`, 400);

		await validTeam(this.credit);
		for await (const tProg of this.teamProgress) {
			await validTeam(tProg.team._id);
		}

		break;

	case 'Analysis':
		await validTeam(this.team);
		for await (const salv of this.salvage) {
			await validUpgrade(salv.gear);
			await validUpgrade(salv.system);
			await validUpgrade(salv.infrastructure);
			await validFacility(salv.facility);
			await validSite(salv.site);
		}

		break;

	case 'Technology':
		await validTeam(this.team);
		break;

	default:
		nexusError(`Invalid Type ${this.type} for research!`, 400);
	}

};

const Research = mongoose.model('Research', ResearchSchema, 'research');

const KnowledgeResearch = Research.discriminator(
	'KnowledgeResearch',
	new Schema({
		type: { type: String, default: 'Knowledge' },
		field: { type: String, enum: ['Biology',
			'Computer Science',
			'Electronics',
			'Engineering',
			'Genetics',
			'Material Science',
			'Physics',
			'Psychology',
			'Social Science',
			'Quantum Mechanics'] },
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
