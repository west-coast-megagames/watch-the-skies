const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const ArticleSchema = new Schema({
  model: { type: String, default: 'Article'},
  publisher: { type: Schema.Types.ObjectId, ref: 'Team'},
  date: { type: Date },
  timestamp: {
    turn: { type: String },
    phase: { type: String },
    turnNum: { type: Number },
    clock: { type: String } 
  },
  location: { type: Schema.Types.ObjectId, ref: 'Site'},
  dateline: { type: String },
  headline: { type: String, required: true, minlength: 1, maxlength: 100 },
  body: { type: String, required: true, minlength: 0, maxlength: 1000 },
  likes: { type: Number },
  tags: { type: String },
  imageSrc: { type: String }
  });

let Article = mongoose.model('article', ArticleSchema);

function validateArticle(article) {
  const schema = {
    agency: Joi.string().required(),
    //turn: Joi.string().required(),
    location: Joi.string().min(2).max(2).required(),
    headline: Joi.string().min(1).max(100).required(),
    body: Joi.string().min(1).max(1000).required(), 
    imageSrc: Joi.string()
  };

  return Joi.validate(article, schema);
}

module.exports = { Article, validateArticle };