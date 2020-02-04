// Function to get the distance between two lat/lon points using the ‘haversine’ formula
function getDistance(lat1,lon1,lat2,lon2) {
    const R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2-lat1); // deg2rad below
    let dLon = deg2rad(lon2-lon1); // deg2rad below

    // Distance formula
    let a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = R * c; // Distance in km
    return d; // Return Distance
}
  
function deg2rad(deg) {
return deg * (Math.PI/180)
}

let test = getDistance(50, 4, 44, 7)
console.log(`Distance is ${test}`);

function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }