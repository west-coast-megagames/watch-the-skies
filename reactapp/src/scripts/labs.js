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
	let myResearch = {name: 'Placeholder'}
	let myProgress = 0;				
	let myLevel = 0;

	if (allResearch.some(el => el._id === _id)) {
		myResearch = allResearch.find(el => el._id === _id);	// lookup entry in the allResearch Obj which holds the Pct
		myProgress = myResearch.progress;						// Progress found in myResearch
		myLevel    = myResearch.level;							// Level of Tech of myResearch
	}
					
	const myTechCost = techCost[myLevel];							// Tech Cost for 100% completion of myResearch 
	let   finalPct	 = (Math.trunc(myProgress*100/myTechCost));		// Pct is progress/cost	
	if (finalPct > 100) { finalPct = 100; }							// Pct displayed is max 100%
	console.log(`${myResearch.name} at ${finalPct}%`)
	return (finalPct);	
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
	console.log(`Get Lab Percentage Called...`)
	const result = newLabCheck(_id, labs);
	if (result >= 0) {		// Lab was updated, so find the new %
		if (labs[result].research !== undefined) {		// Research currently has no focus in that lab object
			return (-1);	// -1 and issue error instead of progress bar
		} else {
			let myResearchID = labs[result].research;	// ID of the tech being researched in this row
			if (myResearchID === undefined) {					// Most cases, obj is a number.  When removed via "X" (user chooses to research nothing), it becomes null
				labs[result].research = '';				 	// initialize the research array to a null instead of null array
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