let gameServer = "http://localhost:5000/";
let mapKey = 'AIzaSyA_d1zJREiLhBphyJNWTQutlZ0yqWpgO3Q'

if (process.env.NODE_ENV === "production") {
  gameServer = "https://project-nexus-prototype.herokuapp.com/";
}

export { gameServer, mapKey };
