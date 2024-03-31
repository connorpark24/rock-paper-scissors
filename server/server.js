const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log('New client connected');

  if (waitingPlayer) {
    const gameSession = [socket, waitingPlayer];
    waitingPlayer = null;

    gameSession.forEach((playerSocket, index) => {
    playerSocket.on('playerChoice', (choice) => {
        gameSession[index] = { socket: playerSocket, choice };
        if (gameSession[0].choice && gameSession[1].choice) {
        const result = determineWinner(gameSession[0].choice, gameSession[1].choice);
        gameSession.forEach((player) => {
            player.socket.emit('gameResult', {
            yourChoice: player.choice,
            opponentChoice: gameSession[1 - gameSession.indexOf(player)].choice,
            result: result.message,
            winner: result.winner === 'player' ? player.socket.id : gameSession[1 - gameSession.indexOf(player)].socket.id
            });
        });
        }
        });
    });
  } else {
    // Wait for an opponent
    waitingPlayer = socket;
    socket.emit('waitingForOpponent');
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const determineWinner = (playerChoice, opponentChoice) => {
  if (playerChoice === opponentChoice) {
    return { winner: 'draw', message: 'It\'s a draw!' };
  }

  const winningCombinations = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };

  if (winningCombinations[playerChoice] === opponentChoice) {
    return { winner: 'player', message: 'You win!' };
  }

  return { winner: 'opponent', message: 'You lose!' };
};

server.listen(4000, () => {
  console.log('Listening on port 4000');
});
