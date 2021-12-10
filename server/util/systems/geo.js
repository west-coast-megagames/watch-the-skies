// Function to get the distance between two lat/lon points using the ‘haversine’ formula
function getDistance(lat1, lon1, lat2, lon2) {
	const R = 6371; // Radius of the earth in km
	const dLat = deg2rad(lat2 - lat1); // deg2rad below
	const dLon = deg2rad(lon2 - lon1); // deg2rad below

	// Distance formula
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c; // Distance in km
	return d; // Return Distance
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}

// let test = getDistance(50, 4, 44, 7)
// console.log(`Distance is ${test}`);

function parseDMS(fullDMS) {
	const parts = fullDMS.split(/[^\d\w\.]+/);
	const lat = ConvertDMSToDD(parts[0], parts[1], parts[2], parts[3]);
	const lng = ConvertDMSToDD(parts[4], parts[5], parts[6], parts[7]);

	return { lat: lat, lng: lng };
}

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
	let dd = Number(degrees) + Number(minutes) / 60 + Number(seconds) / (60 * 60);

	if (direction == 'S' || direction == 'W') {
		dd = dd * -1;
	} // Don't do anything for N or E
	return dd;

}

// let response = parseDMS("36°57'9\" N 110°4'21\" W")
// console.log(response)

// let latDMS = convertToDms(11.5622, false)
// let lngDMS = convertToDms(43.1428, true)

// console.log(`Lat: ${latDMS}, Long: ${lngDMS}`);

function convertToDms(dd, isLng) {
	if (!dd || isNaN(dd)) {
		dd = 0;
	}
	const dir = dd < 0
		? isLng ? 'W' : 'S'
		: isLng ? 'E' : 'N';

	const absDd = Math.abs(dd);
	const deg = absDd | 0;
	const frac = absDd - deg;
	const min = (frac * 60) | 0;
	let sec = frac * 3600 - min * 60;
	// Round it to 2 decimal points.
	sec = Math.round(sec * 100) / 100;
	return deg + '°' + min + '\'' + sec + '"' + dir;
}

module.exports = { getDistance, parseDMS, convertToDms, ConvertDMSToDD };