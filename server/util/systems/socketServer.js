class SocketServer {
    constructor() {
        this.connections = [];
        this.saveUser = this.saveUser.bind(this);
        this.delClient = this.delClient.bind(this);
        this.getUsers = this.getUsers.bind(this);
    }
    saveUser (data, client) {
        client.user = data.user;
        client.team = data.team;
        let index = this.connections.findIndex(el => el.id === client.id)
        this.connections[index] = client;
        //console.log(this.connections);
        return
    }

    delClient (client) {
        let index = this.connections.findIndex(el => el.id === client.id);
        console.log(this.connections[index].name)
        this.connections.splice(index, 1);
        return
    }
    getUsers() {
        let users = []
        for (let client of this.connections) {
            let user = {
                name: client.user,
                team: client.team,
                id: client.id
            };
            users.push(user);
        }
        return users
    }
  }

  module.exports = SocketServer;