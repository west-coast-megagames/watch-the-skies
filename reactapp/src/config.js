let gameServer = 'http://localhost:5000/';
let mapKey = '';

if (process.env.NODE_ENV === "production") {
	gameServer = process.env.serverURL;
	mapKey = process.env.mapKey;
}

export { gameServer, mapKey };