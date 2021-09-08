const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware

// Function Import
const clock = require('../wts/gameClock/gameClock');
const nexusEvent = require('../middleware/events/events');
const { Site } = require('./site');
const { Team } = require('./team');

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
	let newArticle = new Article(article);

	newArticle.date = Date.now();
	newArticle.timestamp = clock.getTimeStamp();

	const team = await Team.findById(newArticle.publisher);
	newArticle.agency = team.code;

	const location = await Site.findById(newArticle.location);
	newArticle.dateline = location.dateline;

	await newArticle.validateArticle();
	newArticle = await newArticle.save();
	newArticle = await newArticle.populateMe();

	nexusEvent.emit('request', 'create', [ newArticle ]);
	logger.info(`The ${this.headline} article has been created`);
	return newArticle;
}

ArticleSchema.methods.edit = async function (articleUpdate) {
	this.publisher = articleUpdate.publisher;
	this.location = articleUpdate.location;
	this.headline = articleUpdate.headline;
	this.body = articleUpdate.body;
	this.tags = articleUpdate.tags;
	this.imageSrc = articleUpdate.imageSrc;
	
	const team = await Team.findById(this.publisher);
	this.agency = team.code;

	const location = await Site.findById(this.location);
	this.dateline = location.dateline;

	await this.validateArticle();
	let article = await this.save();
	article = await article.populateMe();

	nexusEvent.emit('request', 'update', [ article ]);
	logger.info(`The ${this.headline} article has been edited`);
	return article;
}

ArticleSchema.methods.publish = async function () {
	this.published = true;

	let article = await this.save();
	article = await article.populateMe();
	
	nexusEvent.emit('request', 'update', [ article ]);
	logger.info(`The ${this.headline} article has been published`);
	return article;
};

ArticleSchema.methods.react = async function (user, emoji) {
	if (user == undefined) throw Error(`An undefined user cannot react to ${this.headline}`);
	if (emoji == undefined) throw Error(`${user} cannot react to ${this.headline} with an undefined emoji`);

	let index = this.reactions.findIndex(reaction => reaction.user == user && reaction.emoji == emoji);
	if (index >= 0) throw Error(`${user} has already reacted to ${this.headline} with ${emoji}`);

	this.reactions.push({
		user: user,
		emoji: emoji
	});

	let article = await this.save();
	article = await article.populateMe();
	
	nexusEvent.emit('request', 'update', [ article ]);
	logger.info(`The ${this.headline} article has been reacted to by ${user} with ${emoji}`);
	return article;
};

ArticleSchema.methods.unreact = async function (user, emoji) {
	if (user == undefined) throw Error(`An undefined user cannot unreact to ${this.headline}`);
	if (emoji == undefined) throw Error(`${user} cannot unreact to ${this.headline} with an undefined emoji`);

	let index = this.reactions.findIndex(reaction => reaction.user == user && reaction.emoji == emoji);
	if (index < 0) throw Error(`${user} has not reacted to ${this.headline} with ${emoji}`);

	let reactionId = this.reactions[index]._id;

	this.reactions.pull({
		_id: reactionId
	});

	let article = await this.save();
	article = await article.populateMe();

	nexusEvent.emit('request', 'update', [ article ]);
	logger.info(`The ${this.headline} article has been unreacted to by ${user} with ${emoji}`);
	return article;
};

ArticleSchema.methods.comment = async function(user, comment) {
	if (user == undefined) throw Error(`An undefined user cannot comment on ${this.headline}`);
	if (comment == undefined) throw Error(`${user} cannot react to ${this.headline} with an undefined comment`);

	const timestamp = clock.getTimeStamp();

	this.comments.push({
		user: user,
		comment: comment,
		timestamp: timestamp
	});

	let article = await this.save();
	article = await article.populateMe();

	nexusEvent.emit('request', 'update', [ article ]);
	logger.info(`The ${this.headline} article has been commented on by ${user}`);
	return article;
};

ArticleSchema.methods.deleteComment = async function(id) {
	if (id == undefined) throw Error(`Cannot delete a comment with an undefined id on ${this.headline}`);

	let index = this.comments.findIndex(comment => comment._id == id);
	if (index < 0) throw Error(`There does not exist a comment with the id ${id} on ${this.headline}`);

	this.comments.pull({
		_id: id
	});

	let article = await this.save();
	article = await article.populateMe();

	nexusEvent.emit('request', 'update', [ article ]);
	logger.info(`The ${this.headline} article has had the comment with the id ${id} deleted`);
	return article;
};

ArticleSchema.methods.delete = async function () {
	this.hidden = true;

	let article = await this.save();
	article = await article.populateMe();

	nexusEvent.emit('request', 'update', [ article ]);
	logger.info(`The ${this.headline} article has been deleted`);

	return article;
};

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
	if (mainCheck.error != undefined) throw Error(`${mainCheck.error}`, 400);

	const timestampSchma = Joi.object({
		turn: Joi.string().min(1),
		phase: Joi.string().min(1),
		clock: Joi.string().min(1),
		turnNum: Joi.number()
	});

	const timestampCheck = timestampSchma.validate(this, { allowUnknown: true });
	if (timestampCheck.error != undefined) throw Error(`${timestampCheck.error}`, 400);

	await validTeam(this.publisher);
	await validSite(this.location);
};

ArticleSchema.methods.populateMe = async function () {
	return this.populate('publisher', 'name shortName')
		.populate('location', 'name dateline')
		.execPopulate();
};

const Article = mongoose.model('article', ArticleSchema);

module.exports = { Article };
