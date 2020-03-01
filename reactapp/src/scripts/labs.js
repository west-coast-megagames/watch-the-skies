// Function to check if a particular lab is in an Array.  Return -1 if its a new Lab (not in array) or the index if it does exist (already in array)
function newLabCheck(lab, labArray) {
	let i;
	for (i = 0; i < labArray.length; i++) {
		if (labArray[i]._id === lab) {
			return i;
		}
	}
	return -1;
}

function lookupPct (_id, labs, allResearch, techCost) {
	let myResearch = {};	// lookup entry in the allKnowledge Obj which holds the Pct for progress bar
	let myProgress = 0;		// Progress of myResearch
	let myLevel    = 0;		// Level of Tech of myResearch
	let myTechCost = 1;		// Tech Cost for 100% completion of myResearch 	
	const result = newLabCheck(_id, labs);
	if (result >= 0) {		// Lab was updated, so find the new %
		if (labs[result].research.length <= 0) {		// Research currently has no focus in that lab object
			return (-1);	// -1 and issue error instead of progress bar
		} else {
			let myResearchID = labs[result].research[0];	// ID of the tech being researched in this row
			if (myResearchID === null) {					// Most cases, obj is a number.  When removed via "X" (user chooses to research nothing), it becomes null
				labs[result].research = [];					// initialize the research array to a null instead of null array
				return (-1);	// -1 and issue error instead of progress bar
			} else {
				myResearch = allResearch.filter(el => el._id === myResearchID._id);
				myProgress = myResearch[0].progress;
				myLevel    = myResearch[0].level;
				myTechCost = techCost[myLevel];
				return (Math.trunc(myProgress*100/myTechCost));		// Pct is progress/cost
			}
		}

	} else {  			// Could not find an updated lab
		return (-1);	// -1 and issue error instead of progress bar
	}
}

export { newLabCheck, lookupPct };