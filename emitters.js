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
  } else {
    console.log('No presenter socket');
  }
}

function sendGameState(gameState, clients, presenterSocket) {
  console.log('Sending GameState to clients');
  gameState.players.forEach(player => {
    console.log('sendgamestate', player);
    if (clients[player.id]) {
      const socket = clients[player.id].socket;
      socket.emit('gameStateUpdate', gameState);
    }
  });

  if (presenterSocket) {
    presenterSocket.emit('gameStateUpdate', gameState);
  }
}

exports.sendUserlist = sendUserlist;
exports.sendGameState = sendGameState;
