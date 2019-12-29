const io = require('socket.io');
const server = io.listen(5000);
const { sendUserlist, sendGameState } = require('./emitters');
const { logIpAddresses, logClients, logGameState } = require('./loggers');

console.log(
  'Server starts at port 5000 on the following interfaces and ip addresses'
);
logIpAddresses();

const clients = {};
let presenterSocket = null;

let gameState = {
  round: 0,
  players: []
};

server.sockets.on('connection', function(clientSocket) {
  console.log('user connected');
  const id = clientSocket.request._query.id;
  const presenter = clientSocket.request._query.presenter;

  if (presenter) {
    console.log('Presenter connected');
    presenterSocket = clientSocket;
    sendUserlist(gameState, clients, presenterSocket);
    sendGameState(gameState, clients, presenterSocket);

    clientSocket.on('selectPlayer', function(id) {
      if (
        clients[id] &&
        gameState.players.filter(p => p.id === id).length === 0
      ) {
        const { name, time } = clients[id];
        gameState.players = [
          ...gameState.players,
          { id, name, time: 60, active: false }
        ];
        console.log(`Selected player ${id}`);
        logGameState(gameState);
        sendGameState(gameState, clients, presenterSocket);
      } else {
        console.log(
          'Selected invalid player or player already selected - ',
          id
        );
      }
    });

    clientSocket.on('removePlayer', function(id) {
      gameState.players = gameState.players.filter(p => p.id !== id);
      console.log(`Removed player ${id}`);
      logGameState(gameState);
      sendGameState(gameState, clients, presenterSocket);
    });

    clientSocket.on('advanceRound', function() {
      gameState.round += 1;
      sendGameState(gameState, clients, presenterSocket);
    });
  } else if (id) {
    if (clients[id]) {
      console.log('reconnecting user ' + id);
    } else {
      clients[id] = { socket: clientSocket, name: '' };
      // clientSocket.emit('gameStateUpdate', gameState);
    }
    clientSocket.emit('onConnect', { name: clients[id].name, gameState });

    clientSocket.on('disconnect', function() {
      console.log('a user disconnected');
      delete clients[id];
      logClients(clients);
    });
    logClients(clients);
    sendUserlist(clients, presenterSocket);
  } else {
    console.log('No id or presenter flag supplied on connection');
  }

  clientSocket.on('setName', function({ id, name }) {
    clients[id].name = name;
    console.log(`Set name of ${id} to ${name}`);
    const playingPlayer = gameState.players.find(p => p.id === id);
    if (playingPlayer) {
      playingPlayer.name = name;
    }
    logClients(clients);
    sendUserlist(gameState, clients, presenterSocket);
    sendGameState(gameState, clients, presenterSocket);
  });
});
