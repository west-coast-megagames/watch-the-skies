// remove arrVal from arr ... nothing returned
async function clearArrayValue(arr, arrVal) {
	if (arr === undefined) throw new Error('Array not defined in array/clearValue');
	if (arrVal === undefined) throw new Error('Array Element Value not defined in array/clearValue');
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] === arrVal) {
			arr.splice(i, 1);
		}
	}
}

// add arrVal to arr if not already there  ... nothing returned
async function addArrayValue(arr, arrVal) {
	if (arr === undefined) throw new Error('Array not defined in array/addArrayValue');
	if (arrVal === undefined) throw new Error('Array Element Value not defined in array/addArrayValue');
	if (!arr.some(el => el === arrVal)) {
		arr.push(arrVal);
	}
}

// is arrVal in arr?    returns true or false
async function inArray(arr, arrVal) {
	if (arr === undefined) throw new Error('Array not defined in array/inArray');
	if (arrVal === undefined) throw new Error('Array Element Value not defined in array/inArray');
	return arr.some(el => el === arrVal);
}

// return index of arrVal in arr
async function getArrayIndex(arr, arrVal) {
	if (arr === undefined) throw new Error('Array not defined in array/getArrayIndex');
	if (arrVal === undefined) throw new Error('Array Element Value not defined in array/getArrayIndex');
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == arrVal) return i;
	}
	return undefined;
}

module.exports = { clearArrayValue, addArrayValue, inArray, getArrayIndex };