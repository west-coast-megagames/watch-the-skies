// determines if facility is valid for passed unitType (i.e., is it in the unitType array)
function validUnitType (unitTypeArray, testUT) {
	let utFound = false;
	chkLoop:
	for (let i = 0; i < unitTypeArray.length; i++) {
		if (unitTypeArray[i] === 'Any') {
			utFound = true;
			break chkLoop;
		}
		else if (unitTypeArray[i] === testUT) {
			utFound = true;
			break chkLoop;
		}
	}
	return utFound;
}

module.exports = { validUnitType };