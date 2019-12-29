function logClients(clients) {
  console.log('Connected users:');
  console.log('---------------------------------------------------');
  Object.keys(clients).forEach(id => {
    const { name } = clients[id];
    console.log(`${id} - ${name}`);
  });
  console.log('---------------------------------------------------');
}

function logGameState(gameState) {
  console.log('Gamestate:', JSON.stringify(gameState, null, 2));
}

exports.logClients = logClients;
exports.logGameState = logGameState;
