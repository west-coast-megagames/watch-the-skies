const { loadTech } = require('./techTree')
const { loadKnowledge, loadGlobalVariables } = require('./knowledge')

const { logger } = require('../../middleware/winston'); // Import of winston for error logging

const fundingCost = [ 0, 2, 4, 6, 8 ]; // A cost of 3 + funding level per roll currently
const techCost = [ 20, 30, 40, 50, 60, 70 ] // Cost for each level of tech, arbitratily set at increments of 10 currently

const multiplier = { setBack: 0.5, normal: 0.25, fast: 0.6, breakthrough: 0.2 }; // Science Bonus Multipliers

initScience()

async function initScience() {
    logger.info('Loading Global Science variables...')
    await loadGlobalVariables();
    logger.info('Loading knowledge')
    await loadKnowledge(); // Loads the knowledge tree with current knowledge
    logger.info('Loading Tech into Tech Tree...')
    await loadTech() // Loads the tech-tree with the curren science
}

module.exports = { techCost, fundingCost, multiplier }