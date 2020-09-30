const { Site } = require('../../../models/sites/site');

async function genSiteCode (startCode, siteType) {

	// if they didn't send a suggestion ... set to siteType
	if (!startCode || startCode === '') {
		startCode = siteType;
	}

	// if siteType was blank too (???) set to Site
	if (!startCode || startCode === '') {
		startCode = 'Site';
	}

	// are we good? doesn't already exist
	const chkDoc = await Site.find({ code: startCode });
	if (!chkDoc.length) {
		return startCode;
	}

	// otherwise need to find a unique value not already in site
	// get all sites once
	const sFind = await Site.find();

	// need to gen one
	const sCode = startCode + '-' + siteType;
	let testCode = sCode;

	// keep it within valid length
	if (testCode.length > 16) {
		testCode = testCode.substring(0, 15);
	}
	// 300 tries to get one
	let oneFound = false;
	genLoop1:
	for (let i = 0; i < 300; ++i) {
		testCode = testCode + i.toString();
		oneFound = false;
		genLoop2:
		for (let j = 0; j < sFind.length; ++j) {
			if (sFind[j].code === testCode) {
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