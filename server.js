const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { Chess } = require("chess.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const games = {};

io.on("connection", (socket) => {
  socket.on("createGame", (callback) => {
    const gameId = Math.random().toString(36).substring(2, 8);

    games[gameId] = {
      chess: new Chess(),
      players: {
        white: socket.id,
        black: null
      }
    };

    socket.join(gameId);

    callback({
      gameId,
      color: "w",
      fen: games[gameId].chess.fen()
    });
  });

  socket.on("joinGame", ({ gameId }, callback) => {
    const game = games[gameId];

    if (!game) {
      return callback({ error: "Game not found" });
    }

    if (!game.players.black) {
      game.players.black = socket.id;
      socket.join(gameId);

      io.to(gameId).emit("gameStarted", {
        fen: game.chess.fen()
      });

      callback({
        success: true,
        color: "b",
        fen: game.chess.fen()
      });

      return;
    }

    socket.join(gameId);

    callback({
      success: true,
      color: "spectator",
      fen: game.chess.fen()
    });
  });

  socket.on("move", ({ gameId, move }) => {
    const game = games[gameId];

    if (!game) return;

    try {
      const result = game.chess.move(move);

      if (!result) return;

      io.to(gameId).emit("moveMade", {
        fen: game.chess.fen(),
        history: game.chess.history(),
        gameOver: game.chess.isGameOver(),
        turn: game.chess.turn()
      });
    } catch (error) {
      console.log("Invalid move");
    }
  });

  socket.on("disconnect", () => {
    for (const gameId in games) {
      const game = games[gameId];

      if (game.players.white === socket.id) {
        game.players.white = null;
      }

      if (game.players.black === socket.id) {
        game.players.black = null;
      }
    }
  });
});

app.get("/health", (req, res) => {
  res.send("Chess server is running!");
});

server.listen(PORT, () => {
  console.log(`Chess server running on port ${PORT}`);
});
