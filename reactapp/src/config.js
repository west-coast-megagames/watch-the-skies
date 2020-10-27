let gameServer = 'http://localhost:5000/';
let mapKey = '';

if (process.env.NODE_ENV === "production") {
	gameServer = 'https://project-nexus-prototype.herokuapp.com/';
	mapKey = process.env.mapKey;
}

export { gameServer, mapKey };