const { Site, validateSite, BaseSite, validateBase, 
    CitySite, validateCity, CrashSite, validateCrash, Spacecraft, validateSpacecraft } = require('../../../models/sites/site');

async function genSiteCode(startCode, siteType) {
  
  //if they didn't send a suggestion ... set to siteType
  if (!startCode || startCode === "") {
    startCode = siteType;
  }

  // if siteType was blank too (???) set to Site
  if (!startCode || startCode === "") {
    startCode = "Site";
  }

  // are we good? doesn't already exist
  let chkDoc = await Site.find({ siteCode: startCode });
  if (!chkDoc.length) {
    return startCode;
  } 
  
  // otherwise need to find a unique value not already in site
  // get all sites once
  let sFind = await Site.find();
  
  //need to gen one
  let sCode    =  startCode + "-" + siteType;
  let testCode = sCode;
    
  // keep it within valid length
  if (testCode.length > 16) {
    testCode = testCode.substring(0, 15);
  }
  // 300 tries to get one
  genLoop1:
  for (let i = 0; i < 300; ++i ) {
    testCode = testCode + i.toString();
    oneFound = false;
    genLoop2:
    for (let j = 0; j < sFind.length; ++j ) {
      if (sFind[j].siteCode === testCode) {
        oneFound = true;
        break genLoop2;
      } 
    }
    if (!oneFound) {
      break genLoop1;
    }
  }
  
  return testCode;
}

module.exports = { genSiteCode };