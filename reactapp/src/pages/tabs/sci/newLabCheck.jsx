// Check if a particular lab is in an Array.  Return -1 if its a new Lab (not in array) or the index if it does exist (already in array)
function newLabCheck(lab, labArray) {
	let i;
	for (i = 0; i < labArray.length; i++) {
		if (labArray[i]._id === lab) {
			return i;
		}
	}
	return -1;
}
