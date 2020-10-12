const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { validTeam, validSite } = require('../middleware/util/validateDocument');

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
	logger.info(`Validating ${this.model.toLowerCase()} ${this.headline}...`);
	// logger.info(`timestamp coming in to validateArticle ${this.timestamp}`);
	/*
	const timeStampSchema = {
		turn: Joi.string().min(1),
		phase: Joi.string().min(1),
		clock: Joi.string().min(1),
		turnNum: Joi.number().min(0)
	};
	TODO: timestamp is being cleard by Joi ... need to fix
  timestamp: Joi.object(timeStampSchema)
	*/

	const schema = {
		date: Joi.date().less('now'),
		headline: Joi.string().min(1).max(100).required(),
		body: Joi.string().min(1).max(1000)
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	// logger.info(`timestamp after Joi.validate ${this.timestamp}`);
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.publisher);
	await validSite(this.location);

};

const Article = mongoose.model('article', ArticleSchema);

module.exports = { Article };
