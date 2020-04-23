let gameServer = 'http://localhost:5000/;

if (process.env.NODE_ENV === "production") {
  gameServer = 'https://project-nexus-prototype.herokuapp.com/';
} 

export { gameServer };
