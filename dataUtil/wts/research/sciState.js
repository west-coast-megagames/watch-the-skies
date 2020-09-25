const { loadTech } = require("./techTree");
const { loadKnowledge, loadGlobalVariables } = require("./knowledge");

const { logger } = require("../../middleware/log/winston"); // Import of winston for error logging

const fundingCost = [0, 2, 4, 6, 8]; // A cost of 3 + funding level per roll currently
const techCost = [20, 30, 40, 50, 60, 70]; // Arbitratily set at increments of 50 currently

//initScience();

async function initScience() {
  logger.info("Loading Global Science variables...");
  await loadGlobalVariables();
  logger.info("Loading knowledge");
  await loadKnowledge(); // Loads the knowledge tree with current knowledge
  logger.info("Loading Tech into Tech Tree...");
  await loadTech(); // Loads the tech-tree with the curren science
}

module.exports = { techCost, fundingCost };
