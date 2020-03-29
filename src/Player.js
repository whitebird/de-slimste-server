import gameState from './gameState';
import playerList from './playerList';
import { logClients } from './loggers';
import { sendUserlist } from './emitters';

export default function Player(socket, id) {
  socket.join('player');
  if (playerList[id]) {
    console.log('reconnecting user ' + id);
  } else {
    playerList[id] = {
      name: 'Player' + Math.floor(Math.random() * 100),
      socket
    };
    // socket.emit('gameStateUpdate', gameState);
  }
  socket.emit('onConnect', { name: playerList[id].name, gameState });

  socket.on('disconnect', function() {
    console.log('a user disconnected');
    delete playerList[id];
    logClients(playerList);
  });
