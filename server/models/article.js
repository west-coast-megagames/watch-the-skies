const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Function Import
const clock = require('../wts/gameClock/gameClock');

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
	hidden: { type: Boolean, default: false },
	reactions: [{
		user: { type: String },
		emoji: { type: String }
	}],
	comments: [{
		user: { type: String },
		comment: { type: String },
		timestamp: {
			turn: { type: String },
			phase: { type: String },
			turnNum: { type: Number },
			clock: { type: String }
		},
	}],
	published: { type: Boolean, default: false }
});

ArticleSchema.statics.post = async function (article) {
	const Article = mongoose.model('article');
	let newArticle = new Article(req.body);

	newArticle.date = new Date();
	const retTimestamp = clock.getTimeStamp();
	if (retTimestamp) {
		newArticle.timestamp = retTimestamp;
	}
	else {
		newArticle.timestamp = req.body.timestamp;
	}

	logger.info(`new Article time stamp ${newArticle.timestamp}`);
	const location = await Site.findById(newArticle.location);
	newArticle.dateline = location.dateline;
	logger.info(`new Article time stamp ${newArticle.timestamp}`);
	await newArticle.validateArticle();
	logger.info(`new Article time stamp ${newArticle.timestamp}`);

	const docs = await Article.find({ headline: newArticle.headline, publisher: newArticle.publisher });

	if (docs.length < 1) {
		newArticle = await newArticle.save();
		// TODO: Team.populate is NOT working ... avoiding error on logger.info
		await Team.populate(newArticle, { path: 'publisher', model: 'Team', select: 'name' });
		if (newArticle.team) {
			logger.info(`${newArticle.headline} article created for ${newArticle.team.name} ...`);
		}
		return newArticle;
	}
	else {
		nexusError(`An article with the headline ${newArticle.headline} has already been published!`, 400);
	}
}

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

ArticleSchema.methods.publish = async function () {
	this.published = true;

	await this.save();
	logger.info(`The ${this.headline} article has been published`);
};

ArticleSchema.methods.react = async function (user, emoji) {
	if (user == undefined) nexusError(`An undefined user cannot react to ${this.headline}`);
	if (emoji == undefined) nexusError(`${user} cannot react to ${this.headline} with an undefined emoji`);

	let index = this.reactions.findIndex(reaction => reaction.user == user && reaction.emoji == emoji);
	if (index >= 0) nexusError(`${user} has already reacted to ${this.headline} with ${emoji}`);

	this.reactions.push({
		user: user,
		emoji: emoji
	});

	await this.save();
	logger.info(`The ${this.headline} article has been reacted to by ${user} with ${emoji}`);
};

ArticleSchema.methods.unreact = async function (user, emoji) {
	if (user == undefined) nexusError(`An undefined user cannot unreact to ${this.headline}`);
	if (emoji == undefined) nexusError(`${user} cannot unreact to ${this.headline} with an undefined emoji`);

	let index = this.reactions.findIndex(reaction => reaction.user == user && reaction.emoji == emoji);
	if (index < 0) nexusError(`${user} has not reacted to ${this.headline} with ${emoji}`);

	let reactionId = this.reactions[index]._id;

	this.reactions.pull({
		_id: reactionId
	});

	await this.save();
	logger.info(`The ${this.headline} article has been unreacted to by ${user} with ${emoji}`);
}

ArticleSchema.methods.comment = async function(user, comment) {
	if (user == undefined) nexusError(`An undefined user cannot comment on ${this.headline}`);
	if (comment == undefined) nexusError(`${user} cannot react to ${this.headline} with an undefined comment`);

	const timestamp = clock.getTimeStamp();

	this.comments.push({
		user: user,
		comment: comment,
		timestamp: timestamp
	});

	await this.save();
	logger.info(`The ${this.headline} article has been commented on by ${user}`);
};

ArticleSchema.methods.deleteComment = async function(id) {
	if (id == undefined) nexusError(`Cannot delete a comment with an undefined id on ${this.headline}`);

	let index = this.comments.findIndex(comment => comment._id == id);
	if (index < 0) nexusError(`There does not exist a comment with the id ${id} on ${this.headline}`);

	this.comments.pull({
		_id: id
	});

	await this.save();
	logger.info(`The ${this.headline} article has had the comment with the id ${id} deleted`);
};

ArticleSchema.methods.delete = async function () {
	this.hidden = true;

	await this.save();
	logger.info(`The ${this.headline} article has been deleted`);
}

const Article = mongoose.model('article', ArticleSchema);

module.exports = { Article };
