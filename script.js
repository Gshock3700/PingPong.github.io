const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');

canvas.width = 800;
canvas.height = 400;

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;

let playerY = canvas.height / 2 - paddleHeight / 2;
let computerY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;

let playerScore = 0;
let computerScore = 0;

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fill();
}

function movePlayer(e) {
    const rect = canvas.getBoundingClientRect();
    playerY = e.clientY - rect.top - paddleHeight / 2;

    if (playerY < 0) {
        playerY = 0;
    }
    if (playerY > canvas.height - paddleHeight) {
        playerY = canvas.height - paddleHeight;
    }
}

function moveComputer() {
    const computerCenter = computerY + paddleHeight / 2;
    if (computerCenter < ballY - 35) {
        computerY += 6;
    } else if (computerCenter > ballY + 35) {
        computerY -= 6;
    }
}

function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY < 0 || ballY > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    if (ballX < paddleWidth) {
        if (ballY > playerY && ballY < playerY + paddleHeight) {
            ballSpeedX = -ballSpeedX;
            const deltaY = ballY - (playerY + paddleHeight / 2);
            ballSpeedY = deltaY * 0.35;
        } else {
            computerScore++;
            resetBall();
        }
    }

    if (ballX > canvas.width - paddleWidth) {
        if (ballY > computerY && ballY < computerY + paddleHeight) {
            ballSpeedX = -ballSpeedX;
            const deltaY = ballY - (computerY + paddleHeight / 2);
            ballSpeedY = deltaY * 0.35;
        } else {
            playerScore++;
            resetBall();
        }
    }
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = Math.random() * 10 - 5;
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, 'rgba(0, 0, 0, 0.5)');

    // Draw paddles
    drawRect(0, playerY, paddleWidth, paddleHeight, '#fff');
    drawRect(canvas.width - paddleWidth, computerY, paddleWidth, paddleHeight, '#fff');

    // Draw ball
    drawCircle(ballX, ballY, ballSize, '#fff');

    // Update score
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
}

function gameLoop() {
    moveComputer();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', movePlayer);
gameLoop();
