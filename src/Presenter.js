import gameState from './gameState';
import playerList from './playerList';
import { logGameState } from './loggers';
import { sendGameState } from './emitters';
const config = require('./config.json');

let timer = null;

export default function addPresenter(socket) {
  socket.join('presenter');
  sendGameState(gameState, playerList);

  socket.on('selectPlayer', function(id) {
    if (
      playerList[id] &&
      gameState.players.filter(p => p.id === id).length === 0
    ) {
      const { name, time } = playerList[id];
      gameState.players = [
        ...gameState.players,
        { id, name, time: config.startTime, active: false }
      ];
      console.log(`Selected player ${id}`);
      logGameState(gameState);
      sendGameState(gameState, playerList);
    } else {
      console.log('Selected invalid player or player already selected - ', id);
    }
  });

  socket.on('removePlayer', function(id) {
    gameState.players = gameState.players.filter(p => p.id !== id);
    console.log(`Removed player ${id}`);
    logGameState(gameState);
    sendGameState(gameState, playerList);
  });

  socket.on('advanceRound', function() {
    gameState.round += 1;

    // Clearing active player
    gameState.players.forEach(player => (player.active = false));
    if (gameState.round === 1) {
      // 3-6-9
      gameState.currentQuestion = 1;
      selectRandomPlayer(gameState.players).active = true;
    } else if (gameState.round === 2) {
      /// Open deur
      selectLowestTimePlayer(gameState.players).active = true;
    } else if (gameState.round === 5) {
      /// Finale
      gameState.answers = [
        { hit: 'Ant', found: false },
        { hit: 'Woord', found: true },
        { hit: 'Heel lang woord', found: false },
        { hit: 'nogiets', found: true },
        { hit: 'qsdf', found: false }
      ];
      selectLowestTimePlayer(gameState.players).active = true;
    }
    logGameState(gameState);
    sendGameState(gameState, playerList);
  });

  socket.on('selectNextPlayer', function() {
    console.log('selectNextPlayer');
    if (gameState.round === 1 || gameState.round === 5) {
      const index = gameState.players.findIndex(
        player => player.active === true
      );
      gameState.players[index].active = false;
      if (index < gameState.players.length - 1) {
        console.log();
        gameState.players[index + 1].active = true;
      } else {
        gameState.players[0].active = true;
      }
    } else if (gameState.round === 2) {
      const index = gameState.players.findIndex(
        player => player.active === true
      );
      gameState.players[index].active = false;
      gameState.players[index].played = true;
      const playersLeft = gameState.players.filter(player => !player.played);

      if (playersLeft.length !== 0) {
        selectLowestTimePlayer(playersLeft).active = true;
      } else {
        gameState.players.forEach(player => (player.played = false));
        selectLowestTimePlayer(gameState.players).active = true;
      }
    }
    logGameState(gameState);
    sendGameState(gameState, playerList);
  });

  socket.on('toggleTimer', function() {
    console.log('toggleTimer', timer);
    if (timer !== null) {
      console.log('stop Timer');
      clearInterval(timer);
      gameState.timerRunning = false;
      timer = null;
    } else {
      console.log('start Timer');
      gameState.timerRunning = true;
      const index = gameState.players.findIndex(
        player => player.active === true
      );
      const activePlayer = gameState.players[index];
      timer = setInterval(() => {
        activePlayer.time = Math.max(activePlayer.time - 1, 0);
        if (activePlayer.time <= 0) {
          clearInterval(timer);
        }
        sendGameState(gameState, playerList);
      }, 100);
    }
    // logGameState(gameState);
    sendGameState(gameState, playerList);
  });

  socket.on('showAnswers', function() {
    console.log('showAnswers');
    gameState.answers.forEach(answer => (answer.found = true));
    sendGameState(gameState, playerList);
  });

  socket.on('setAnswers', function(answers) {
    console.log('setAnswers');
    gameState.answers.forEach((answer, i) => {
      answer.hit = answers[i];
      answer.found = false;
    });
    sendGameState(gameState, playerList);
  });

  socket.on('setTime', function(times) {
    console.log('setTime');
    gameState.players.forEach((player, i) => {
      player.time = times[i];
    });
    logGameState(gameState);
    sendGameState(gameState, playerList);
  });

  socket.on('foundAnswer', function(hit) {
    console.log('foundAnswer');

    const answerIndex = gameState.answers.findIndex(
      answer => answer.hit === hit
    );
    if (gameState.answers[answerIndex].found === false) {
      gameState.answers[answerIndex].found = true;
    }
    const playerIndex = gameState.players.findIndex(
      player => player.active === false
    );
    const inActivePlayer = gameState.players[playerIndex];
    inActivePlayer.time = Math.max(inActivePlayer.time - 200, 0);
    if (inActivePlayer.time <= 0) {
      clearInterval(timer);
    }

    let allAnswersFound = true;
    gameState.answers.forEach(answer => {
      if (answer.found === false) {
        allAnswersFound = false;
      }
    });
    if (allAnswersFound) {
      if (timer !== null) {
        console.log('stop Timer');
        clearInterval(timer);
        gameState.timerRunning = false;
        timer = null;
      }
    }

    sendGameState(gameState, playerList);
  });

  socket.on('addTimeToSelectedPlayer', function() {
    console.log('addTimeToSelectedPlayer');
    const playingPlayer = gameState.players.find(p => p.active === true);
    playingPlayer.time += config.roundScores[gameState.round - 1];
    logGameState(gameState);
    sendGameState(gameState, playerList);
  });

  socket.on('nextQuestion', function() {
    console.log('nextQuestion');
    if (gameState.round === 1) {
      gameState.currentQuestion += 1;
    } else if (gameState.round === 5) {
      gameState.answers.forEach(answer => {
        answer.found = false;
        answer.hit = '';
      });
    }
    logGameState(gameState);
    sendGameState(gameState, playerList);
  });
}

function selectRandomPlayer(players) {
  return players[Math.floor(Math.random() * players.length)];
}

function selectLowestTimePlayer(players) {
  return players.reduce((prev, cur) => (prev.time < cur.time ? prev : cur));
}
