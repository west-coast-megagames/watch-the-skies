class SocketServer {
    constructor() {
        this.connections = [];
        this.saveClient = this.saveTeam.bind(this);
        this.saveUser = this.saveUser.bind(this);
        this.delClient = this.delClient.bind(this);
        this.getUsers = this.getUsers.bind(this);
    }
    saveTeam (team, client) {
        client.team = team;
        this.connections.splice(this.connections.indexOf(el => el.id === client.id), 1, client);
        //console.log(this.connections);
    }
    saveUser (user, client) {
        client.user = user;
        this.connections.splice(this.connections.indexOf(el => el.id === client.id), 1, client);
        //console.log(this.connections);
    }

    delClient (client) {
        this.connections.splice(this.connections.indexOf(el => el.id === client.id), 1);
    }
    getUsers() {
        let users = []
        for (let client of this.connections) {
            let user = {};
            user.name = client.user
            user.team = client.team
            users.push(user);
        }
        return users
    }
  }

  module.exports = SocketServer;