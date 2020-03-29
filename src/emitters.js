import server from './socketServer';
export function sendUserlist(gameState, clients) {
  const clientsArray = Object.keys(clients).map(id => ({
    id,
    name: clients[id].name
  }));
  console.log('Sending clients to presenter', clientsArray);

  server.sockets.in('presenter').emit('onUserConnect', {
    gameState,
    connectedUsers: clientsArray
  });
}

export function sendGameState(gameState, clients) {
  console.log('Sending GameState to clients');
  // gameState.players.forEach(player => {
  //   console.log('sendgamestate', player);
  //   if (clients[player.id]) {
  //     server.sockets.in('player').emit('gameStateUpdate', gameState);
  //   }
  // });
  server.sockets.in('player').emit('gameStateUpdate', gameState);
  server.sockets.in('presenter').emit('gameStateUpdate', gameState);
}
