const socket = io();

let gameId = new URLSearchParams(location.search).get("game");
let game = new Chess();

const board = document.getElementById("board");
const status = document.getElementById("status");

const pieces = {
  wK:"♔", wQ:"♕", wR:"♖", wB:"♗", wN:"♘", wP:"♙",
  bK:"♚", bQ:"♛", bR:"♜", bB:"♝", bN:"♞", bP:"♟"
};

function drawBoard() {
  board.innerHTML = "";

  const position = game.board();

  position.forEach((row, r) => {
    row.forEach((piece, c) => {

      const square = document.createElement("div");

      square.className =
        "square " + ((r + c) % 2 === 0 ? "light" : "dark");

      square.dataset.square =
        String.fromCharCode(97 + c) + (8 - r);

      if (piece) {
        square.textContent =
          pieces[piece.color + piece.type.toUpperCase()];
      }

      board.appendChild(square);
    });
  });
}

socket.emit("joinGame", gameId);

socket.on("
