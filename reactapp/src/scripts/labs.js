//---------------------------------------------
// Function to check if a particular lab is in an Array.  Return -1 if its a new Lab (not in array) or the index if it does exist (already in array)
//---------------------------------------------
function newLabCheck(lab, labArray) {
	let i;
	for (i = 0; i < labArray.length; i++) {
		if (labArray[i]._id === lab) {
			return i;
		}
	}
	return -1;
}

//---------------------------------------------
// Function to lookup the % progress of a given ResearchID for a given team
//---------------------------------------------
function lookupPct (
	_id, 					// ID of the research selected to lookup
	allResearch, 			// Array of all research objects for this team
	techCost				// Array of tech costs
) 
{
	const myResearch = allResearch.filter(el => el._id === _id);	// lookup entry in the allResearch Obj which holds the Pct
	const myProgress = myResearch[0].progress;						// Progress found in myResearch
	const myLevel    = myResearch[0].level;							// Level of Tech of myResearch
	const myTechCost = techCost[myLevel];							// Tech Cost for 100% completion of myResearch 	
	return (Math.trunc(myProgress*100/myTechCost));					// Pct is progress/cost
}


//---------------------------------------------
// Function to lookup the % progress of a given ResearchID for a given Lab of a given team.  Return
// -1 if there is an error and reset labs.research to a zerolength array
//---------------------------------------------
function getLabPct (
	_id, 					// ID of the research selected within the lab
	labs, 					// list of all labs for this team
	allResearch, 			// Array of all research objects for this team
	techCost				// Array of tech costs
) 
{
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
				return lookupPct(myResearchID._id, allResearch, techCost);
			}
		}

	} else {  			// Could not find an updated lab
		return (-1);	// -1 and issue error instead of progress bar
	}
}

export { newLabCheck, getLabPct, lookupPct };