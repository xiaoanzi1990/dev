const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const playerEl = document.getElementById('player');
const resultEl = document.getElementById('result');
const restartBtn = document.getElementById('restart');

const GRID = 15;
const CELL = 36;
const PADDING = 20;
const PIECE = 15;

canvas.width = canvas.height = CELL * (GRID - 1) + PADDING * 2;

let board = [];
let current = 1;
let gameOver = false;

function init() {
    board = Array.from({ length: GRID }, () => Array(GRID).fill(0));
    current = 1;
    gameOver = false;
    playerEl.textContent = '当前玩家：黑棋';
    resultEl.textContent = '';
    draw();
}

function draw() {
    ctx.fillStyle = '#dcb35c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(PADDING + i * CELL, PADDING);
        ctx.lineTo(PADDING + i * CELL, PADDING + (GRID - 1) * CELL);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(PADDING, PADDING + i * CELL);
        ctx.lineTo(PADDING + (GRID - 1) * CELL, PADDING + i * CELL);
        ctx.stroke();
    }

    for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
            if (board[r][c]) {
                drawPiece(r, c, board[r][c]);
            }
        }
    }
}

function drawPiece(r, c, color) {
    const x = PADDING + c * CELL;
    const y = PADDING + r * CELL;
    ctx.beginPath();
    ctx.arc(x, y, PIECE, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, PIECE);
    if (color === 1) {
        g.addColorStop(0, '#555');
        g.addColorStop(1, '#000');
    } else {
        g.addColorStop(0, '#fff');
        g.addColorStop(1, '#ccc');
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.closePath();
}

canvas.addEventListener('click', (e) => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const c = Math.round((x - PADDING) / CELL);
    const r = Math.round((y - PADDING) / CELL);
    if (r < 0 || r >= GRID || c < 0 || c >= GRID || board[r][c]) return;

    board[r][c] = current;
    draw();

    if (checkWin(r, c, current)) {
        gameOver = true;
        resultEl.textContent = current === 1 ? '黑棋获胜！' : '白棋获胜！';
        return;
    }
    if (board.flat().every(v => v)) {
        gameOver = true;
        resultEl.textContent = '平局！';
        return;
    }

    current = current === 1 ? 2 : 1;
    playerEl.textContent = current === 1 ? '当前玩家：黑棋' : '当前玩家：白棋';
});

function checkWin(r, c, color) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    return dirs.some(([dr, dc]) => {
        let count = 1;
        for (let i = 1; i < 5; i++) {
            if (board[r + dr * i]?.[c + dc * i] === color) count++;
            else break;
        }
        for (let i = 1; i < 5; i++) {
            if (board[r - dr * i]?.[c - dc * i] === color) count++;
            else break;
        }
        return count >= 5;
    });
}

restartBtn.addEventListener('click', init);
init();
