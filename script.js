const startBtn = document.getElementById('start');
const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');
const modeSelect = document.getElementById('mode');
const gameContainer = document.getElementById('game-container');

const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const resetButton = document.getElementById('reset');
const gameBoard = document.getElementById('game');
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let confettiParticles = [];
let animationFrame;

let player1 = 'Player 1';
let player2 = 'Player 2';
let mode = 'person';
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

startBtn.addEventListener('click', () => {
  player1 = player1Input.value.trim() || 'Player 1';
  player2 = player2Input.value.trim() || (modeSelect.value==='computer'?'Computer':'Player 2');
  mode = modeSelect.value;
  gameContainer.style.display = 'block';
  document.getElementById('settings').style.display = 'none';
  resetGame();
});

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (board[index] !== '' || !gameActive) return;

  makeMove(index, currentPlayer);
  if(mode==='computer' && gameActive && currentPlayer==='O') {
    setTimeout(computerMove, 300);
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player);
  checkResult();
  if(gameActive) currentPlayer = currentPlayer==='X'?'O':'X';
  updateStatus();
}

function computerMove() {
  let emptyIndices = board.map((v,i)=>v===''?i:null).filter(v=>v!==null);
  if(emptyIndices.length===0) return;
  const choice = emptyIndices[Math.floor(Math.random()*emptyIndices.length)];
  makeMove(choice,'O');
}

function updateStatus() {
  if(!gameActive) return;
  status.textContent = currentPlayer==='X'? player1 + "'s turn": player2 + "'s turn";
}

function checkResult() {
  let roundWon = false;
  let winningLine = null;

  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      winningLine = condition;
      break;
    }
  }

  if (roundWon) {
    status.textContent = (currentPlayer==='X'?player1:player2) + ' wins!';
    gameActive = false;
    drawWinningLine(winningLine);
    startConfetti();
    return;
  }

  if (!board.includes('')) {
    status.textContent = 'Draw!';
    gameActive = false;
    return;
  }
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('X', 'O');
  });
  removeWinningLine();
  stopConfetti();
  updateStatus();
}

function drawWinningLine(line) {
  removeWinningLine();
  const div = document.createElement('div');
  div.id = 'winner-line';
  const positions = line.map(i => cells[i].getBoundingClientRect());
  const rect0 = positions[0];
  const rect2 = positions[2];

  const containerRect = gameBoard.getBoundingClientRect();
  const x1 = rect0.left - containerRect.left + rect0.width/2;
  const y1 = rect0.top - containerRect.top + rect0.height/2;
  const x2 = rect2.left - containerRect.left + rect2.width/2;
  const y2 = rect2.top - containerRect.top + rect2.height/2;

  const length = Math.hypot(x2-x1, y2-y1);
  const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;

  div.style.width = length + 'px';
  div.style.transform = `rotate(${angle}deg)`;
  div.style.top = y1 + 'px';
  div.style.left = x1 + 'px';
  gameBoard.appendChild(div);
}

function removeWinningLine() {
  const oldLine = document.getElementById('winner-line');
  if (oldLine) oldLine.remove();
}

// Confetti
function createConfetti() {
  const colors = ['#ff5252','#536dfe','#ffca28','#00c853','#ff4081'];
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiParticles.forEach(p => {
    ctx.beginPath();
    ctx.lineWidth = p.r/2;
    ctx.strokeStyle = p.color;
    ctx.moveTo(p.x + p.tilt + p.r/4, p.y);
    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r/4);
    ctx.stroke();
  });
  updateConfetti();
}

function updateConfetti() {
  confettiParticles.forEach(p => {
    p.tiltAngle += p.tiltAngleIncrement;
    p.y += (Math.cos(p.d) + 3 + p.r/2)/2;
    p.x += Math.sin(p.d);
    p.tilt = Math.sin(p.tiltAngle) * 15;

    if (p.y > canvas.height) {
      p.y = -10;
      p.x = Math.random() * canvas.width;
    }
  });
}

function animateConfetti() {
  drawConfetti();
  animationFrame = requestAnimationFrame(animateConfetti);
}

function startConfetti() {
  confettiParticles = [];
  createConfetti();
  animateConfetti();
}

function stopConfetti() {
  cancelAnimationFrame(animationFrame);
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
