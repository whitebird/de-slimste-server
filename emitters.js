function sendUserlist(gameState, clients, presenterSocket) {
  if (presenterSocket) {
    const clientsArray = Object.keys(clients).map(id => ({
      id,
      name: clients[id].name
    }));
    console.log('Sending clients to presenter', clientsArray);
    presenterSocket.emit('onUserConnect', {
      gameState,
      connectedUsers: clientsArray
    });
  }
}

function sendGameState(gameState, clients, presenterSocket) {
  console.log('Sending GameState to clients');
  gameState.players.forEach(player => {
    console.log('sendgamestate', player);
    const socket = clients[player.id].socket;
    socket.emit('gameStateUpdate', gameState);
  });
  // Object.values(clients).forEach(client =>
  //   client.socket.emit('gameStateUpdate', gameState)
  // );
  presenterSocket.emit('gameStateUpdate', gameState);
}

exports.sendUserlist = sendUserlist;
exports.sendGameState = sendGameState;
