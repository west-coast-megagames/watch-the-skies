// Country Model - Using Mongoose Model
const { Country, validateCountry } = require('../../models/country');

const countryLoadDebugger = require('debug')('app:countryLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkCountry() {
  for (const country of await Country.find()
                                     .populate("zone", "name")) { 
    if (!country.populated("zone")) {  
      logger.error(`Zone link missing for Country ${country.name}`);
    }
/*
    //check borderedBy array of IDs
    for ()
*/
    
  }
};

module.exports = chkCountry;