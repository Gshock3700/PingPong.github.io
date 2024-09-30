interface GameState {
    playerY: number;
    computerY: number;
    ballX: number;
    ballY: number;
    ballSpeedX: number;
    ballSpeedY: number;
    playerScore: number;
    computerScore: number;
}

declare function initializeCppEngine(): void;
declare function updateCppEngine(state: GameState): void;
declare function cleanupCppEngine(): void;

class PingPongGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private playerScoreElement: HTMLElement;
    private computerScoreElement: HTMLElement;
    private state: GameState;
    private luaVM: any; // LuaVM type would be defined by the Lua WebAssembly module

    private readonly paddleWidth: number = 10;
    private readonly paddleHeight: number = 80;
    private readonly ballSize: number = 10;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.playerScoreElement = document.getElementById('player-score')!;
        this.computerScoreElement = document.getElementById('computer-score')!;

        this.canvas.width = 800;
        this.canvas.height = 400;

        this.state = {
            playerY: this.canvas.height / 2 - this.paddleHeight / 2,
            computerY: this.canvas.height / 2 - this.paddleHeight / 2,
            ballX: this.canvas.width / 2,
            ballY: this.canvas.height / 2,
            ballSpeedX: 5,
            ballSpeedY: 5,
            playerScore: 0,
            computerScore: 0
        };

        this.canvas.addEventListener('mousemove', this.movePlayer.bind(this));
        
        this.initializeLua();
        initializeCppEngine();
        
        this.gameLoop();
    }

    private async initializeLua() {
        const response = await fetch('game_events.lua');
        const luaScript = await response.text();
        this.luaVM = await import('lua-wasm'); // Assume we're using a Lua WebAssembly module
        this.luaVM.doString(luaScript);
    }

    private drawRect(x: number, y: number, width: number, height: number, color: string): void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    private drawCircle(x: number, y: number, radius: number, color: string): void {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        this.ctx.fill();
    }

    private movePlayer(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        this.state.playerY = e.clientY - rect.top - this.paddleHeight / 2;

        if (this.state.playerY < 0) {
            this.state.playerY = 0;
        }
        if (this.state.playerY > this.canvas.height - this.paddleHeight) {
            this.state.playerY = this.canvas.height - this.paddleHeight;
        }
    }

    private moveComputer(): void {
        const computerCenter = this.state.computerY + this.paddleHeight / 2;
        if (computerCenter < this.state.ballY - 35) {
            this.state.computerY += 6;
        } else if (computerCenter > this.state.ballY + 35) {
            this.state.computerY -= 6;
        }

        if (this.state.computerY < 0) {
            this.state.computerY = 0;
        }
        if (this.state.computerY > this.canvas.height - this.paddleHeight) {
            this.state.computerY = this.canvas.height - this.paddleHeight;
        }
    }

    private updateBall(): void {
        this.state.ballX += this.state.ballSpeedX;
        this.state.ballY += this.state.ballSpeedY;

        if (this.state.ballY < 0 || this.state.ballY > this.canvas.height) {
            this.state.ballSpeedY = -this.state.ballSpeedY;
            this.luaVM.call('onWallHit', this.state.ballY < 0 ? 'top' : 'bottom');
        }

        if (this.state.ballX < this.paddleWidth) {
            if (this.state.ballY > this.state.playerY && this.state.ballY < this.state.playerY + this.paddleHeight) {
                this.state.ballSpeedX = -this.state.ballSpeedX;
                const deltaY = this.state.ballY - (this.state.playerY + this.paddleHeight / 2);
                this.state.ballSpeedY = deltaY * 0.35;
                this.luaVM.call('onPaddleHit', 'player');
            } else {
                this.state.computerScore++;
                this.resetBall();
                this.luaVM.call('onScore', 'computer');
            }
        }

        if (this.state.ballX > this.canvas.width - this.paddleWidth) {
            if (this.state.ballY > this.state.computerY && this.state.ballY < this.state.computerY + this.paddleHeight) {
                this.state.ballSpeedX = -this.state.ballSpeedX;
                const deltaY = this.state.ballY - (this.state.computerY + this.paddleHeight / 2);
                this.state.ballSpeedY = deltaY * 0.35;
                this.luaVM.call('onPaddleHit', 'computer');
            } else {
                this.state.playerScore++;
                this.resetBall();
                this.luaVM.call('onScore', 'player');
            }
        }
    }

    private resetBall(): void {
        this.state.ballX = this.canvas.width / 2;
        this.state.ballY = this.canvas.height / 2;
        this.state.ballSpeedX = -this.state.ballSpeedX;
        this.state.ballSpeedY = Math.random() * 10 - 5;
    }

    private draw(): void {
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, 'rgba(0, 0, 0, 0.5)');
        this.drawRect(0, this.state.playerY, this.paddleWidth, this.paddleHeight, '#fff');
        this.drawRect(this.canvas.width - this.paddleWidth, this.state.computerY, this.paddleWidth, this.paddleHeight, '#fff');
        this.drawCircle(this.state.ballX, this.state.ballY, this.ballSize, '#fff');

        this.playerScoreElement.textContent = this.state.playerScore.toString();
        this.computerScoreElement.textContent = this.state.computerScore.toString();
    }

    private gameLoop(): void {
        this.moveComputer();
        this.updateBall();
        updateCppEngine(this.state);
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    public cleanup(): void {
        cleanupCppEngine();
    }
}

const game = new PingPongGame();

window.addEventListener('beforeunload', () => {
    game.cleanup();
});
