const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema

const ArticleSchema = new Schema({
	model: { type: String, default: 'Article' },
	publisher: { type: Schema.Types.ObjectId, ref: 'Team' },
	date: { type: Date, required: true },
	timestamp: {
		turn: { type: String },
		phase: { type: String },
		turnNum: { type: Number },
		clock: { type: String }
	},
	location: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
	dateline: { type: String },
	headline: { type: String, required: true, minlength: 1, maxlength: 100 },
	body: { type: String, minlength: 1, maxlength: 1000 },
	likes: { type: Number, default: 0 },
	tags: [{ type: String }],
	imageSrc: { type: String },
	gameState: [],
	agency: { type: String },
	hidden: { type: Boolean, default: false }
});

// validateArticle method
ArticleSchema.methods.validateArticle = async function () {
	const { validTeam, validSite } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.headline}...`);
	logger.info(`timestamp coming in to validateArticle ${this.timestamp}`);

	const schema = Joi.object({
		date: Joi.date().less('now').required(),
		headline: Joi.string().min(1).max(100).required(),
		body: Joi.string().min(1).max(1000)
	});

	const mainCheck = schema.validate(this, { allowUnknown: true });
	if (mainCheck.error != undefined) nexusError(`${mainCheck.error}`, 400);

	const timestampSchma = Joi.object({
		turn: Joi.string().min(1),
		phase: Joi.string().min(1),
		clock: Joi.string().min(1),
		turnNum: Joi.number()
	});

	const timestampCheck = timestampSchma.validate(this, { allowUnknown: true });
	if (timestampCheck.error != undefined) nexusError(`${timestampCheck.error}`, 400);

	await validTeam(this.publisher);
	await validSite(this.location);
};

const Article = mongoose.model('article', ArticleSchema);

module.exports = { Article };
