import dotenv from 'dotenv'
dotenv.config()

let gameServer = 'http://localhost:5000/';
let mapKey = '';

if (process.env.NODE_ENV === "production") {
	gameServer = 'https://project-nexus-prototype.herokuapp.com/';
	console.log(process.env)
	mapKey = process.env.MAP_KEY;
}

export { gameServer, mapKey };