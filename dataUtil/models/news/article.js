const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

const ArticleSchema = new Schema({
  model: { type: String, default: "Article" },
  publisher: { type: Schema.Types.ObjectId, ref: "Team" },
  date: { type: Date },
  timestamp: {
    turn: { type: String },
    phase: { type: String },
    turnNum: { type: Number },
    clock: { type: String },
  },
  location: { type: Schema.Types.ObjectId, ref: "Site" },
  dateline: { type: String },
  headline: { type: String, required: true, minlength: 1, maxlength: 100 },
  articleBody: { type: String, minlength: 1, maxlength: 1000 },
  likes: { type: Number, default: 0 },
  tags: [{ type: String }],
  imageSrc: { type: String },
  agency: { type: String },
});

let Article = mongoose.model("article", ArticleSchema);

function validateArticle(article) {
  const schema = {
    headline: Joi.string().min(1).max(100).required(),
    articleBody: Joi.string().min(1).max(1000),
    gameState: [],
  };

  return Joi.validate(article, schema, { allowUnknown: true });
}

function validateTimestamp(timestamp) {
  const schema = {
    turn: Joi.string().min(1),
    phase: Joi.string().min(1),
    clock: Joi.string().min(1),
    turnNum: Joi.number().min(0),
  };

  return Joi.validate(timestamp, schema, { allowUnknown: true });
}

module.exports = { Article, validateArticle, validateTimestamp };
