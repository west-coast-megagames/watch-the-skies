// Article Model - Using Mongoose Model
const { Article, validateArticle } = require('../../models/news/article');
const { Team } = require('../../models/team/team');
const { Site } = require('../../models/sites/site');

const articleCheckDebugger = require('debug')('app:articleCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkArticle(runFlag) {
  
  for (const article of await Article.find()
                               .populate("publisher", "name teamType")
                               .populate("location", "name dateline")) { 

    let testPropertys = article.toObject();                                
    
    if (!testPropertys.hasOwnProperty('publisher')) {
      logger.error(`Publisher Field missing for Article ${article.headline} ${article._id}`);
    }

    if (!article.populated("publisher")) {  
      logger.error(`Publisher link missing for Article ${article.headline} ${article._id}`);
    }

    if (!testPropertys.hasOwnProperty('location')) {
      logger.error(`Location Field missing for Article ${article.headline} ${article._id}`);
    }

    if (!article.populated("location")) {  
      logger.error(`Location link missing for Article ${article.headline} ${article._id}`);
    }

    /*
    let { error } = validateArticle(article);
    if ( error)  {
      logger.error(`Article Validation Error For ${article.headline} Error: ${error.details[0].message}`);
    }
    */

  }
  return true;
};

module.exports = chkArticle;