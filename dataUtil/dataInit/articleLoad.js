const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initArticle.json",
  "utf8"
);
const articleDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const articleLoadDebugger = require("debug")("app:articleLoad");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Article Model - Using Mongoose Model
const {
  Article,
  validateArticle,
  validateTimestamp,
} = require("../models/news/article");
const { Team } = require("../models/team/team");
const { Site } = require("../models/sites/site");
const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runArticleLoad(runFlag) {
  try {
    //articleLoadDebugger("Jeff in runArticleLoad", runFlag);
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllArticles(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    articleLoadDebugger(`Catch runArticleLoad Error: ${err.message}`);
    logger.error(`Catch runArticleLoad Error: ${err.message}`, { meta: err });
    return false;
  }
}

async function initLoad(doLoad) {
  //articleLoadDebugger("Jeff in initLoad", doLoad, articleDataIn.length);
  if (!doLoad) return;

  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for (let data of articleDataIn) {
    ++recReadCount;
    await loadArticle(data, recCounts);
  }
  logger.info(
    `Article Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );
}

async function loadArticle(iData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = iData.headline;

  try {
    //there is no article key field or updates ... just new ones
    // New Article/Article here
    let convDate = new Date(iData.date);
    let article = new Article({
      timestamp: iData.timestamp,
      headline: iData.headline,
      articleBody: iData.articleBody,
      likes: iData.likes,
      tags: iData.tags,
      imageSrc: iData.imageSrc,
      date: convDate,
    });

    if (iData.publisher != "") {
      let team = await Team.findOne({ teamCode: iData.publisher });
      if (!team) {
        loadError = true;
        loadErrorMsg = "Publisher Not Found: " + iData.publisher;
      } else {
        article.publisher = team._id;
        article.agency = team.shortName;
      }
    }

    if (iData.location != "") {
      let site = await Site.findOne({ siteCode: iData.location });
      if (!site) {
        loadError = true;
        loadErrorMsg = "Location Not Found: " + iData.location;
      } else {
        article.location = site._id;
        article.dateline = site.dateline;
      }
    }

    try {
      let { error } = validateArticle(article);
      if (error) {
        loadError = true;
        loadErrorMsg = "Article Validation Error: " + error.message;
      }
    } catch (err) {
      loadError = true;
      loadErrorMsg = "Article Validation Error: " + err.message;
    }

    try {
      let { error } = validateTimestamp(article.timestamp);
      if (error) {
        loadError = true;
        loadErrorMsg = "Article Timestamp Validation Error: " + error.message;
      }
    } catch (err) {
      loadError = true;
      loadErrorMsg = "Article Timestamp Validation Error: " + err.message;
    }

    if (loadError) {
      logger.error(
        `Article skipped due to errors: ${loadName} ${loadErrorMsg}`
      );
      ++rCounts.loadErrCount;
      return;
    } else {
      try {
        let articleSave = await article.save();

        ++rCounts.loadCount;
        logger.info(`${articleSave.headline} add saved to article collection`);
      } catch (err) {
        ++rCounts.loadErrCount;
        logger.error(`New Article Save Error: ${err}`, { meta: err });
        return;
      }
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch Article Error: ${err.message}`, { meta: err });
    return;
  }
}

async function deleteAllArticles(doLoad) {
  if (!doLoad) return;

  try {
    for await (const article of Article.find()) {
      let id = article._id;

      try {
        let articleDel = await Article.findByIdAndRemove(id);
        if ((articleDel = null)) {
          logger.error(`The Article with the ID ${id} was not found!`);
        }
      } catch (err) {
        logger.error(`Article Delete All Error: ${err.message}`, { meta: err });
      }
    }
    logger.info("All Articles succesfully deleted!");
  } catch (err) {
    logger.error(`Delete All Articles Catch Error: ${err.message}`, {
      meta: err,
    });
  }
}

module.exports = runArticleLoad;
