const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
canvas.width = 240;
canvas.height = 400;

const nextCanvas = document.getElementById("next-piece");
const nextContext = nextCanvas.getContext("2d");
nextCanvas.width = 100;
nextCanvas.height = 100;

const blockSize = 20; // Tamanho de cada bloco
const cols = canvas.width / blockSize;
const rows = canvas.height / blockSize;

// Tabuleiro e variáveis de jogo
let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let currentPiece = null;
let nextPiece = null;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let skipCount = 3;
let dropInterval = 500;
let gameInterval = null;

// Peças do Tetris
const pieces = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]]  // Z
];

// Funções auxiliares
function drawMatrix(matrix, offset, ctx) {
  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        ctx.fillStyle = "red";
        ctx.fillRect((x + offset.x) * blockSize, (y + offset.y) * blockSize, blockSize, blockSize);
        ctx.strokeStyle = "#000";
        ctx.strokeRect((x + offset.x) * blockSize, (y + offset.y) * blockSize, blockSize, blockSize);
      }
    });
  });
}

function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, { x: 0, y: 0 }, context);
}

function mergePiece() {
  currentPiece.matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        board[currentPiece.pos.y + y][currentPiece.pos.x + x] = cell;
      }
    });
  });
}

function collide() {
  return currentPiece.matrix.some((row, y) =>
    row.some((cell, x) => {
      if (cell) {
        const newY = currentPiece.pos.y + y;
        const newX = currentPiece.pos.x + x;
        return (
          newY >= rows || newX < 0 || newX >= cols || board[newY][newX]
        );
      }
      return false;
    })
  );
}

function rotate(matrix) {
  return matrix[0].map((_, index) =>
    matrix.map((row) => row[index]).reverse()
  );
}

function resetPiece() {
  if (nextPiece === null) nextPiece = randomPiece();
  currentPiece = nextPiece;
  nextPiece = randomPiece();
  currentPiece.pos = { x: Math.floor(cols / 2) - 1, y: 0 };

  if (collide()) {
    clearInterval(gameInterval);
    alert("Game Over!");
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    resetGame();
  }
}

function randomPiece() {
  const matrix = pieces[Math.floor(Math.random() * pieces.length)];
  return { matrix, pos: { x: 0, y: 0 } };
}

function clearLines() {
  let cleared = 0;
  board = board.filter((row) => {
    if (row.every((cell) => cell !== 0)) {
      cleared++;
      return false;
    }
    return true;
  });
  while (board.length < rows) board.unshift(Array(cols).fill(0));
  score += cleared * 10;
  document.getElementById("score").textContent = score;
}

function dropPiece() {
  currentPiece.pos.y++;
  if (collide()) {
    currentPiece.pos.y--;
    mergePiece();
    clearLines();
    resetPiece();
  }
}

// Funções de controle
function movePiece(dir) {
  currentPiece.pos.x += dir;
  if (collide()) currentPiece.pos.x -= dir;
}

function rotatePiece() {
  const oldMatrix = currentPiece.matrix;
  currentPiece.matrix = rotate(currentPiece.matrix);
  if (collide()) currentPiece.matrix = oldMatrix;
}

function skipPiece() {
  if (skipCount > 0) {
    skipCount--;
    resetPiece();
    document.getElementById("skip-button").textContent = `Skip Piece (${skipCount})`;
  }
}

function resetGame() {
  board = Array.from({ length: rows }, () => Array(cols).fill(0));
  score = 0;
  skipCount = 3;
  document.getElementById("score").textContent = score;
  document.getElementById("high-score").textContent = highScore;
  document.getElementById("skip-button").textContent = `Skip Piece (${skipCount})`;
  nextPiece = randomPiece();
  resetPiece();
}

// Listeners
document.getElementById("start-button").addEventListener("click", () => {
  resetGame();
  gameInterval = setInterval(() => {
    drawBoard();
    drawMatrix(currentPiece.matrix, currentPiece.pos, context);
    dropPiece();
    drawMatrix(nextPiece.matrix, { x: 0, y: 0 }, nextContext);
  }, dropInterval);
});

document.getElementById("rotate-button").addEventListener("click", rotatePiece);
document.getElementById("skip-button").addEventListener("click", skipPiece);
document.getElementById("stop-button").addEventListener("click", () => {
  clearInterval(gameInterval);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") movePiece(-1);
  if (e.key === "ArrowRight") movePiece(1);
  if (e.key === "ArrowDown") dropPiece();
  if (e.key === "ArrowUp") rotatePiece();
});
