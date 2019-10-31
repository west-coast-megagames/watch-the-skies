const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const ArticleSchema = new Schema({
  agency: { type: String, uppercase: true, required: true },
  turn: { type: String, required: true },
  date: { type: Date, default: Date.now() },
  location: { type: String, required: true, minlength: 2, maxlength: 2 },
  headline: { type: String, required: true, minlength: 10, maxlength: 100 },
  body: {type: String, required: true, minlength: 60, maxlength: 1000},
  imageSrc: { type: String }
});

let Article = mongoose.model('article', ArticleSchema);

function validateArticle(article) {
  const schema = {
    agency: Joi.string().required(),
    turn: Joi.string().required(),
    date: Joi.date(), 
    location: Joi.string().min(2).max(2).required(),
    headline: Joi.string().min(10).max(100).required(),
    body: Joi.string().min(60).max(1000).required(), 
    imageSrc: Joi.string()
  };

  return Joi.validate(article, schema);
}

module.exports = { Article, validateArticle };