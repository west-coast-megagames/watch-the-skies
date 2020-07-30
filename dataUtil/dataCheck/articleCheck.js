// Article Model - Using Mongoose Model
const {
  Article,
  validateArticle,
  validateTimestamp,
} = require("../models/news/article");
const { Team } = require("../models/team/team");
const { Site } = require("../models/sites/site");

const articleCheckDebugger = require("debug")("app:articleCheck");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

async function chkArticle(runFlag) {
  for (const article of await Article.find()
    //.populate("publisher", "name teamType")  does not work with .lean()
    //.populate("location", "name dateline")   does not work with .lean()
    .lean()) {
    //does not work with .lean()
    //let testPropertys = article.toObject();

    if (!article.hasOwnProperty("model")) {
      logger.error(
        `model missing for Article ${article.headline} ${article._id}`
      );
    }

    if (!article.hasOwnProperty("gameState")) {
      logger.error(
        `gameState missing for Article ${article.headline} ${article._id}`
      );
    }

    if (!article.hasOwnProperty("date")) {
      logger.error(
        `date missing for Article ${article.headline} ${article._id}`
      );
    }

    if (!article.hasOwnProperty("timestamp")) {
      logger.error(
        `timestamp missing for Article ${article.headline} ${article._id}`
      );
    } else {
      if (!article.timestamp.hasOwnProperty("turn")) {
        logger.error(
          `turn timestamp missing for User ${article.headline} ${article._id}`
        );
      }

      if (!article.timestamp.hasOwnProperty("phase")) {
        logger.error(
          `phase timestamp missing for User ${article.headline} ${article._id}`
        );
      }

      if (!article.timestamp.hasOwnProperty("turnNum")) {
        logger.error(
          `turnNum timestamp missing for User ${article.headline} ${article._id}`
        );
      }
      if (!article.timestamp.hasOwnProperty("clock")) {
        logger.error(
          `clock timestamp missing for User ${article.headline} ${article._id}`
        );
      }
    }

    if (!article.hasOwnProperty("dateline")) {
      logger.error(
        `dateline missing for Article ${article.headline} ${article._id}`
      );
    } else {
      if (
        article.dateline === "" ||
        article.dateline == undefined ||
        article.dateline == null
      ) {
        logger.error(
          `dateline is blank for Article ${article.headline} ${article._id}`
        );
      }
    }

    if (!article.hasOwnProperty("headline")) {
      logger.error(
        `headline missing for Article ${article.headline} ${article._id}`
      );
    } else {
      if (
        article.headline === "" ||
        article.headline == undefined ||
        article.headline == null
      ) {
        logger.error(
          `headline is blank for Article ${article.headline} ${article._id}`
        );
      }
    }

    if (!article.hasOwnProperty("articleBody")) {
      logger.error(
        `articleBody missing for Article ${article.headline} ${article._id}`
      );
    } else {
      if (
        article.articleBody === "" ||
        article.articleBody == undefined ||
        article.articleBody == null
      ) {
        logger.error(
          `articleBody is blank for Article ${article.headline} ${article._id}`
        );
      }
    }

    if (!article.hasOwnProperty("likes")) {
      logger.error(
        `likes missing for Article ${article.headline} ${article._id}`
      );
    }

    if (!article.hasOwnProperty("tags")) {
      logger.error(
        `tags missing for Article ${article.headline} ${article._id}`
      );
    }

    if (!article.hasOwnProperty("imageSrc")) {
      logger.error(
        `imageSrc missing for Article ${article.headline} ${article._id}`
      );
    }

    if (!article.hasOwnProperty("agency")) {
      logger.error(
        `agency missing for Article ${article.headline} ${article._id}`
      );
    }

    if (!article.hasOwnProperty("publisher")) {
      logger.error(
        `Publisher Field missing for Article ${article.headline} ${article._id}`
      );
    } else {
      let team = await Team.findById({ _id: article.publisher });
      if (!team) {
        logger.error(
          `team/publisher reference is invalid for Article ${article.headline} ${article._id}`
        );
      }
    }

    /* does not work with .lean()
    if (!article.populated("publisher")) {  
      logger.error(`Publisher link missing for Article ${article.headline} ${article._id}`);
    }
    */

    if (!article.hasOwnProperty("location")) {
      logger.error(
        `Location Field missing for Article ${article.headline} ${article._id}`
      );
    } else {
      let site = await Site.findById({ _id: article.location });
      if (!site) {
        logger.error(
          `site/location reference is invalid for Article ${article.headline} ${article._id}`
        );
      }
    }

    try {
      let { error } = validateArticle(article);
      if (error) {
        logger.error(
          `Article Validation Error For ${article.headline} ${article._id} Error: ${error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `Article Validation Error For ${article.headline} ${article._id} Error: ${err.details[0].message}`
      );
    }

    try {
      let { error } = validateTimestamp(article.timestamp);
      if (error) {
        logger.error(
          `Article timestamp Validation Error For ${article.headline} ${article._id} Error: ${error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `Article timestamp Validation Error For ${article.headline} ${article._id} Error: ${err.details[0].message}`
      );
    }
  }
  return true;
}

module.exports = chkArticle;
