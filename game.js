// 遊戲常數
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

// 遊戲狀態
let gameState = {
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    gameRunning: false,
    gamePaused: false,
    difficulty: 'easy',
    speed: 7,
};

// 難度設定
const difficultySettings = {
    easy: 7,
    medium: 12,
    hard: 18,
    extreme: 25,
};

// 難度名稱對應
const difficultyNames = {
    easy: '簡單',
    medium: '中等',
    hard: '困難',
    extreme: '極難',
};

// 遊戲變數
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const difficultyDisplay = document.getElementById('difficulty');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const difficultySelect = document.getElementById('difficultySelect');

let gameLoop = null;

// 初始化遊戲
function initGame() {
    gameState.snake = [{ x: 10, y: 10 }];
    gameState.food = generateFood();
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.gameRunning = false;
    gameState.gamePaused = false;
    updateDisplay();
    draw();
    showOverlay(true);
}

// 更新難度
function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    gameState.speed = difficultySettings[difficulty];
    difficultyDisplay.textContent = difficultyNames[difficulty];
}

// 生成食物
function generateFood() {
    let newFood;
    let collision;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
        collision = gameState.snake.some(
            (segment) => segment.x === newFood.x && segment.y === newFood.y
        );
    } while (collision);
    return newFood;
}

// 開始遊戲
function startGame() {
    if (gameState.gameRunning) return;
    gameState.gameRunning = true;
    gameState.gamePaused = false;
    showOverlay(false);
    pauseBtn.disabled = false;
    pauseBtn.textContent = '暫停';
    difficultySelect.disabled = true;
    
    // 清除舊的遊戲迴圈
    if (gameLoop) clearInterval(gameLoop);
    
    // 設置遊戲迴圈
    gameLoop = setInterval(update, 1000 / gameState.speed);
}

// 暫停/繼續遊戲
function togglePause() {
    if (!gameState.gameRunning) return;
    
    gameState.gamePaused = !gameState.gamePaused;
    pauseBtn.textContent = gameState.gamePaused ? '繼續' : '暫停';
    
    if (gameState.gamePaused) {
        clearInterval(gameLoop);
    } else {
        gameLoop = setInterval(update, 1000 / gameState.speed);
    }
}

// 重新開始遊戲
function resetGame() {
    clearInterval(gameLoop);
    initGame();
    pauseBtn.disabled = true;
    difficultySelect.disabled = false;
}

// 更新遊戲狀態
function update() {
    if (!gameState.gameRunning || gameState.gamePaused) return;

    // 更新方向
    gameState.direction = gameState.nextDirection;

    // 計算蛇頭新位置
    const head = gameState.snake[0];
    const newHead = {
        x: head.x + gameState.direction.x,
        y: head.y + gameState.direction.y,
    };

    // 檢查邊界碰撞
    if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
    ) {
        endGame('撞牆了！');
        return;
    }

    // 檢查自咬碰撞
    if (gameState.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame('咬到自己了！');
        return;
    }

    // 添加新頭部
    gameState.snake.unshift(newHead);

    // 檢查食物碰撞
    if (newHead.x === gameState.food.x && newHead.y === gameState.food.y) {
        gameState.score += 10;
        updateDisplay();
        gameState.food = generateFood();
    } else {
        // 移除尾部（如果沒有吃到食物）
        gameState.snake.pop();
    }

    draw();
}

// 遊戲結束
function endGame(reason) {
    clearInterval(gameLoop);
    gameState.gameRunning = false;

    // 更新最高分
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.highScore);
        updateDisplay();
    }

    showOverlay(true, reason);
}

// 顯示/隱藏覆蓋層
function showOverlay(show, reason = '') {
    if (show) {
        gameOverlay.classList.remove('hidden');
        if (reason) {
            overlayTitle.textContent = reason;
            overlayMessage.innerHTML = `最終得分: <strong>${gameState.score}</strong><br>最高分: <strong>${gameState.highScore}</strong>`;
            startBtn.textContent = '再玩一次';
        } else {
            overlayTitle.textContent = '準備好了嗎？';
            overlayMessage.textContent = '點擊「開始遊戲」或按下任意方向鍵開始';
            startBtn.textContent = '開始遊戲';
        }
    } else {
        gameOverlay.classList.add('hidden');
    }
}

// 繪製遊戲
function draw() {
    // 清空畫布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 繪製網格（可選）
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }

    // 繪製蛇
    gameState.snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇頭
            ctx.fillStyle = '#4CAF50';
            ctx.shadowColor = 'rgba(76, 175, 80, 0.8)';
            ctx.shadowBlur = 10;
        } else {
            // 蛇身
            ctx.fillStyle = '#66BB6A';
            ctx.shadowColor = 'rgba(102, 187, 106, 0.5)';
            ctx.shadowBlur = 5;
        }

        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    });

    // 重置陰影
    ctx.shadowColor = 'transparent';

    // 繪製食物
    ctx.fillStyle = '#FF5252';
    ctx.shadowColor = 'rgba(255, 82, 82, 0.8)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * CELL_SIZE + CELL_SIZE / 2,
        gameState.food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 重置陰影
    ctx.shadowColor = 'transparent';
}

// 更新顯示
function updateDisplay() {
    scoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;
    difficultyDisplay.textContent = difficultyNames[gameState.difficulty];
}

// 鍵盤控制
document.addEventListener('keydown', (e) => {
    if (!gameState.gameRunning && e.key !== 'r' && e.key !== 'R') return;

    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            if (gameState.direction.y === 0) {
                gameState.nextDirection = { x: 0, y: -1 };
                if (!gameState.gameRunning) startGame();
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (gameState.direction.y === 0) {
                gameState.nextDirection = { x: 0, y: 1 };
                if (!gameState.gameRunning) startGame();
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (gameState.direction.x === 0) {
                gameState.nextDirection = { x: -1, y: 0 };
                if (!gameState.gameRunning) startGame();
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (gameState.direction.x === 0) {
                gameState.nextDirection = { x: 1, y: 0 };
                if (!gameState.gameRunning) startGame();
            }
            break;
        case ' ':
            e.preventDefault();
            if (gameState.gameRunning) togglePause();
            break;
        case 'r':
        case 'R':
            e.preventDefault();
            resetGame();
            break;
    }
});

// 事件監聽
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);

difficultySelect.addEventListener('change', (e) => {
    setDifficulty(e.target.value);
});

// 觸控控制（行動設備）
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (!gameState.gameRunning) {
        startGame();
        return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && gameState.direction.x === 0) {
            gameState.nextDirection = { x: 1, y: 0 };
        } else if (diffX < 0 && gameState.direction.x === 0) {
            gameState.nextDirection = { x: -1, y: 0 };
        }
    } else {
        if (diffY > 0 && gameState.direction.y === 0) {
            gameState.nextDirection = { x: 0, y: 1 };
        } else if (diffY < 0 && gameState.direction.y === 0) {
            gameState.nextDirection = { x: 0, y: -1 };
        }
    }
});

// 初始化
window.addEventListener('load', () => {
    setDifficulty('easy');
    initGame();
    highScoreDisplay.textContent = gameState.highScore;
});
