import server from './socketServer';
import addPresenter from './Presenter';
import addPlayer from './Player';
import gameState from './gameState';
import playerList from './playerList';
const { sendUserlist, sendGameState } = require('./emitters');
const { logIpAddresses, logClients, logGameState } = require('./loggers');
console.log(
  'Server starts at port 5000 on the following interfaces and ip addresses'
);
logIpAddresses();

server.sockets.on('connection', function(clientSocket) {
  console.log('user connected');
  const id = clientSocket.request._query.id;
  const isPresenter = clientSocket.request._query.presenter;

  if (isPresenter) {
    addPresenter(clientSocket);
  } else if (id) {
    addPlayer(clientSocket, id);
  } else {
    console.log('No id or presenter flag supplied on connection');
  }

  clientSocket.on('setName', function({ id, name }) {
    playerList[id].name = name;
    console.log(`Set name of ${id} to ${name}`);
    const playingPlayer = gameState.players.find(p => p.id === id);
    if (playingPlayer) {
      playingPlayer.name = name;
    }
    logClients(playerList);
    sendUserlist(gameState, playerList);
    sendGameState(gameState, playerList);
  });
});
