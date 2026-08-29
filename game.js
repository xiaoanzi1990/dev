(function () {
    const GRID = 20;
    const CELL = 20;
    const INITIAL_SPEED = 200;
    const SPEED_INCREMENT = 15;
    const SPEED_THRESHOLD = 50;
    const MIN_SPEED = 70;
    const SCORE_PER_FOOD = 10;

    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("score");
    const bestScoreEl = document.getElementById("best-score");
    const overlay = document.getElementById("overlay");
    const overlayTitle = document.getElementById("overlay-title");
    const overlayMsg = document.getElementById("overlay-msg");
    const startBtn = document.getElementById("start-btn");

    let snake, direction, inputQueue, food, score, bestScore, speed, loopTimer;

    bestScore = parseInt(localStorage.getItem("snake_best") || "0", 10);
    bestScoreEl.textContent = bestScore;

    function init() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        direction = { x: 1, y: 0 };
        inputQueue = [];
        score = 0;
        speed = INITIAL_SPEED;
        scoreEl.textContent = "0";
        generateFood();
    }

    function generateFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * GRID),
                y: Math.floor(Math.random() * GRID)
            };
        } while (snake.some(function (c) { return c.x === pos.x && c.y === pos.y; }));
        food = pos;
    }

    function isOpposite(dir) {
        return direction.x + dir.x === 0 && direction.y + dir.y === 0;
    }

    function tick() {
        if (inputQueue.length > 0) {
            var next = inputQueue.shift();
            if (!isOpposite(next)) {
                direction = next;
            }
        }

        var head = snake[0];
        var nx = head.x + direction.x;
        var ny = head.y + direction.y;

        if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
            gameOver();
            return;
        }

        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === nx && snake[i].y === ny) {
                gameOver();
                return;
            }
        }

        snake.unshift({ x: nx, y: ny });

        if (nx === food.x && ny === food.y) {
            score += SCORE_PER_FOOD;
            scoreEl.textContent = score;
            if (score > bestScore) {
                bestScore = score;
                bestScoreEl.textContent = bestScore;
                localStorage.setItem("snake_best", bestScore);
            }
            var steps = Math.floor(score / SPEED_THRESHOLD);
            speed = Math.max(MIN_SPEED, INITIAL_SPEED - steps * SPEED_INCREMENT);
            generateFood();
        } else {
            snake.pop();
        }

        draw();
        loopTimer = setTimeout(tick, speed);
    }

    function draw() {
        ctx.fillStyle = "#0f0f23";
        ctx.fillRect(0, 0, 400, 400);

        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        for (var i = 0; i <= GRID; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL, 0);
            ctx.lineTo(i * CELL, 400);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL);
            ctx.lineTo(400, i * CELL);
            ctx.stroke();
        }

        for (var i = 0; i < snake.length; i++) {
            var seg = snake[i];
            var brightness = 1 - (i / snake.length) * 0.5;
            ctx.fillStyle = "rgba(0, 230, 118, " + brightness + ")";
            ctx.shadowColor = i === 0 ? "#00e676" : "transparent";
            ctx.shadowBlur = i === 0 ? 8 : 0;
            ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = "#ff1744";
        ctx.shadowColor = "#ff1744";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function gameOver() {
        clearTimeout(loopTimer);
        overlayTitle.textContent = "游戏结束";
        overlayMsg.textContent = "得分：" + score;
        startBtn.textContent = "再来一局";
        overlay.classList.remove("hidden");
    }

    function startGame() {
        init();
        overlay.classList.add("hidden");
        draw();
        loopTimer = setTimeout(tick, speed);
    }

    startBtn.addEventListener("click", startGame);

    function setDir(x, y) {
        inputQueue.push({ x: x, y: y });
    }

    document.addEventListener("keydown", function (e) {
        switch (e.key) {
            case "ArrowUp": case "w": case "W": e.preventDefault(); setDir(0, -1); break;
            case "ArrowDown": case "s": case "S": e.preventDefault(); setDir(0, 1); break;
            case "ArrowLeft": case "a": case "A": e.preventDefault(); setDir(-1, 0); break;
            case "ArrowRight": case "d": case "D": e.preventDefault(); setDir(1, 0); break;
        }
    });

    document.getElementById("btn-up").addEventListener("touchstart", function (e) { e.preventDefault(); setDir(0, -1); });
    document.getElementById("btn-down").addEventListener("touchstart", function (e) { e.preventDefault(); setDir(0, 1); });
    document.getElementById("btn-left").addEventListener("touchstart", function (e) { e.preventDefault(); setDir(-1, 0); });
    document.getElementById("btn-right").addEventListener("touchstart", function (e) { e.preventDefault(); setDir(1, 0); });

    var touchStartX, touchStartY;
    canvas.addEventListener("touchstart", function (e) {
        var t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
    });

    canvas.addEventListener("touchend", function (e) {
        if (touchStartX === undefined) return;
        var t = e.changedTouches[0];
        var dx = t.clientX - touchStartX;
        var dy = t.clientY - touchStartY;
        var absDx = Math.abs(dx);
        var absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) < 20) return;

        if (absDx > absDy) {
            setDir(dx > 0 ? 1 : -1, 0);
        } else {
            setDir(0, dy > 0 ? 1 : -1);
        }
        touchStartX = undefined;
    });

    draw();
})();
