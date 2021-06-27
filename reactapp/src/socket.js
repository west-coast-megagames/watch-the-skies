import { io } from "socket.io-client";
import { gameServer } from './config';

const URL = gameServer;
const socket = io(URL, { autoConnect: false });

// DEBUG event showing any event thrown over the socket in console
/**
socket.onAny((event, ...args) => {
  console.log(event, args);
}); 
 */

export function initConnection(user, team, version) {
  console.log('Socket Connecting....')
  socket.auth = { username: user.username, team: team ? team.shortName : "Unassigned" , version }
    
  console.log(socket);
  socket.connect();
}

export default socket;