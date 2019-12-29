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

server.on('connection', function(socket, next) {
  console.log('user connected');
  const id = socket.request._query.id;
  const presenter = socket.request._query.presenter;

  if (presenter) {
    console.log('Presenter connected');
    presenterSocket = socket;
    sendUserlist(gameState, clients, presenterSocket);

    socket.on('selectPlayer', function(id) {
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
  } else if (id) {
    if (clients[id]) {
      console.log('reconnecting user ' + id);
      socket.emit('onConnect', { name: clients[id].name, gameState });
    } else {
      clients[id] = { socket, name: '' };
    }
    logClients(clients);
    sendUserlist(clients, presenterSocket);
  } else {
    console.log('No id or presenter flag supplied on connection');
  }

  socket.on('setName', function({ id, name }) {
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
