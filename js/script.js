/* eslint-disable no-alert */
/* eslint-disable no-plusplus */

class Ball {
  constructor(canvas, dx = 8, dy = -8) {
    this.x = canvas.width / 2;
    this.y = canvas.height - 30;
    this.dx = dx;
    this.dy = dy;
    this.ballRadius = 15;
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  }
}

class Paddle {
  constructor(canvas, width = 200, height = 10) {
    this.canvas = canvas;
    this.height = height;
    this.width = width;
    this.x = (this.canvas.width - this.width) / 2;
  }

  render(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.canvas.height - this.height, this.width, this.height);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.closePath();
  }
}

class Brick {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.status = 1;
    this.color = Brick.getRandomColor();
  }

  static getRandomColor() {
    const letters = '0123456789ABCDEF';
    let str = '#';
    for (let i = 0; i < 6; i++) {
      str += letters[Math.floor(Math.random() * 16)];
    }
    return str;
  }
}

class Stat {
  constructor(canvas, maxLives = 5) {
    this.canvas = canvas;
    this.lives = maxLives;
    this.score = 0;
  }

  render(ctx) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 65, 20);
    ctx.fillText(`Score: ${this.score}`, 8, 20);
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('myCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ball = new Ball(this.canvas);

    this.paddle = new Paddle(this.canvas);
    this.rightPressed = false;
    this.leftPressed = false;
    document.addEventListener('keydown', this.keyDownHandler.bind(this), false);
    document.addEventListener('keyup', this.keyUpHandler.bind(this), false);
    document.addEventListener('mousemove', this.mouseMoveHandler.bind(this), false);

    this.bricks = [];
    this.brickRowCount = 10;
    this.brickColumnCount = 20;
    this.brickWidth = 60;
    this.brickHeight = 30;
    this.brickPadding = 10;
    this.brickOffsetTop = 30;
    this.brickOffsetLeft = 100;
    for (let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.brickRowCount; r++) {
        const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
        const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
        this.bricks[c][r] = new Brick(brickX, brickY);
      }
    }

    this.stat = new Stat(this.canvas);
  }

  keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      this.rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      this.leftPressed = true;
    }
  }

  keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      this.rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      this.leftPressed = false;
    }
  }

  mouseMoveHandler(e) {
    const relativeX = e.clientX - this.canvas.offsetLeft;
    if (relativeX > 0 && relativeX < this.canvas.width) {
      this.paddle.x = relativeX - this.paddle.width / 2;
    }
  }

  collisionDetection() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        const b = this.bricks[c][r];
        if (b.status === 1) {
          if (
            this.ball.x > b.x
            && this.ball.x < b.x + this.brickWidth
            && this.ball.y > b.y
            && this.ball.y < b.y + this.brickHeight
          ) {
            this.ball.dy = -this.ball.dy / Math.abs(this.ball.dy) * (Math.ceil(Math.random() * 8) + 4);
            b.status = 0;
            this.stat.score++;
            if (
              this.stat.score
              === this.brickRowCount * this.brickColumnCount
            ) {
              alert('YOU WIN, CONGRATULATIONS!');
              document.location.reload();
            }
          }
        }
      }
    }
  }

  drawBricks() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        if (this.bricks[c][r].status === 1) {
          this.ctx.beginPath();
          this.ctx.rect(
            this.bricks[c][r].x,
            this.bricks[c][r].y,
            this.brickWidth,
            this.brickHeight,
          );
          this.ctx.fillStyle = this.bricks[c][r].color;
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    }
  }

  run() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ball.render(this.ctx);
    this.paddle.render(this.ctx);
    this.stat.render(this.ctx);
    this.collisionDetection();
    this.drawBricks();
    if (
      this.ball.x + this.ball.dx > this.canvas.width - this.ball.ballRadius
      || this.ball.x + this.ball.dx < this.ball.ballRadius
    ) {
      this.ball.dx = -this.ball.dx / Math.abs(this.ball.dx) * (Math.ceil(Math.random() * 8) + 4);
    }
    if (this.ball.y + this.ball.dy < this.ball.ballRadius) {
      this.ball.dy = -this.ball.dy / Math.abs(this.ball.dy) * (Math.ceil(Math.random() * 8) + 4);
    } else if (
      this.ball.y + this.ball.dy
      > this.canvas.height - this.ball.ballRadius
    ) {
      if (
        this.ball.x > this.paddle.x
        && this.ball.x < this.paddle.x + this.paddle.width
      ) {
        this.ball.dy = -this.ball.dy / Math.abs(this.ball.dy) * (Math.ceil(Math.random() * 8) + 4);
      } else {
        this.stat.lives--;
        if (!this.stat.lives) {
          alert('GAME OVER');
          document.location.reload();
        } else {
          this.ball.x = this.canvas.width / 2;
          this.ball.y = this.canvas.height - 30;
          this.ball.dx = 8;
          this.ball.dy = -8;
          this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        }
      }
    }
    if (
      this.rightPressed
      && this.paddle.x < this.canvas.width - this.paddle.width
    ) {
      this.paddle.x += 10;
    } else if (this.leftPressed && this.paddle.x > 0) {
      this.paddle.x -= 10;
    }
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    requestAnimationFrame(this.run.bind(this));
  }
}

const newGame = new Game();
newGame.run();
