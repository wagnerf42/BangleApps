// constants for bricks positions...
const brickWidth = 10;
const brickHeight = 20;
const numColumns = 5;
const ballRadius = 3;
const brickDistance = 2 * ballRadius;
const colors = ["#ff0000", "#ffa500", "#ffff00", "#00ff00", "#00ffff"];

const topBorder = 12;
const availableHeight = g.getHeight() - topBorder;
const bricksPerColumns = Math.floor(availableHeight / (brickHeight + 2));
const startY =
  topBorder +
  Math.floor((availableHeight - bricksPerColumns * (brickHeight + 2)) / 2);
const detectionWidth = brickWidth + brickDistance;
const firstColumnX = g.getWidth() - detectionWidth * numColumns - 2;
const columnsOffset = (firstColumnX - ballRadius) % detectionWidth;

const heart = Graphics.createImage(`
.##...##.
####.####
#########
#########
.#######.
..#####..
...###...
....#....
`);
const firstHeartX = g.getWidth()/2 - heart.width - 4;

// Adjust this value based on the accelerometer reading when the watch is at rest vertically
let restingY = -0.35;
let game = null;
let gameInterval;

class Game {
  constructor() {
    this.lives = 3;
    this.score = 0;
    this.remainingBricks = numColumns * bricksPerColumns;
    this.paddleY = topBorder + availableHeight / 2;
    this.paddleSpeed = 0;
    this.ball = {
      x: g.getWidth() / 2, // Initial X position of the ball
      y: this.paddleY, // Initial Y position of the ball
      radius: ballRadius, // Radius of the ball
      speedX: 2, // Initial speed of the ball along the X-axis
      speedY: 2, // Initial speed of the ball along the Y-axis
    };

    let bricks = new Uint8Array(numColumns * bricksPerColumns * 3);

    // Initialize bricks
    let c = 0;
    let columnX = firstColumnX;
    for (let i = 0; i < numColumns; i++) {
      for (let j = 0; j < bricksPerColumns; j++) {
        let y = startY + j * (brickHeight + 2);
        bricks[c] = columnX;
        bricks[c + 1] = y;
        bricks[c + 2] = 1; // brick is active
        c += 3;
      }
      columnX += detectionWidth;
    }
    this.bricks = bricks;
    this.firstColumnIndex =
      (this.bricks[0] - columnsOffset - this.ball.radius) / detectionWidth;
    this.initialDisplay();
  }

  drawPaddle(color) {
    g.setColor(color);
    g.fillRect(2, this.paddleY - 20, 5, this.paddleY + 20);
  }

  drawBall(x, y, color) {
    g.setColor(color);
    g.fillCircle(x, y, this.ball.radius);
  }

  initialDisplay() {
    let c = 0;
    for(let i = 0 ; i < this.lives ; i++) {
      g.drawImage(heart, firstHeartX + i*(heart.width+4), 2);
    }
    for (let i = 0; i < numColumns; i++) {
      let color = colors[i];
      g.setColor(color);
      for (let j = 0; j < bricksPerColumns; j++) {
        let x = this.bricks[c];
        let y = this.bricks[c + 1];
        let active = this.bricks[c + 2];
        c += 3;
        if (active == 1) {
          g.fillRect(x, y, x + brickWidth, y + brickHeight);
        }
      }
    }
  }

  updatePaddle() {
    // Get accelerometer data
    const accelY = Bangle.getAccel().y;

    // Clear the old paddle position
    this.drawPaddle(g.getBgColor());

    // Adjust paddle speed based on acceleration on the y-axis
    this.paddleSpeed = (restingY - accelY) * 30; // You can adjust the multiplier for sensitivity

    const oldY = this.paddleY;
    // Adjust paddle position based on accelerometer data
    this.paddleY += this.paddleSpeed;

    // Ensure the paddle stays within the screen boundaries
    this.paddleY = Math.max(
      topBorder + 20,
      Math.min(g.getHeight() - 20, this.paddleY)
    );
    if (this.paddleSpeed > 0) {
      this.paddleSpeed = Math.min(
        Math.abs(this.paddleSpeed),
        this.paddleY - oldY
      );
    } else {
      this.paddleSpeed = Math.max(
        Math.abs(this.paddleSpeed),
        this.paddleY - oldY
      );
    }

    // Draw the new paddle position
    this.drawPaddle(1);
  }

  updateBall() {
    let ball = this.ball;
    let old_x = ball.x;
    let old_y = ball.y;

    // Update the ball's position
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Bounce off the top and bottom walls
    if (
      ball.y - ball.radius < topBorder ||
      ball.y + ball.radius > g.getHeight()
    ) {
      ball.speedY = -ball.speedY;
    }

    // Bounce off the right wall
    if (ball.x + ball.radius > g.getWidth()) {
      ball.speedX = -ball.speedX;
    }

    // Bounce off the paddle
    if (
      ball.x - ball.radius < 7 &&
      ball.y > this.paddleY - 20 &&
      ball.y < this.paddleY + 20
    ) {
      ball.speedX = Math.abs(ball.speedX);
      ball.speedY += this.paddleSpeed * 0.3;
    }

    // Check collision with bricks
    let collisionColumn =
      Math.floor((ball.x - columnsOffset - ball.radius) / detectionWidth) -
      this.firstColumnIndex;
    if (collisionColumn >= 0 && collisionColumn < numColumns) {
      // now find the collisionning lines
      let ymin = ball.y - ball.radius;
      let ymax = ball.y + ball.radius;
      let line1 = Math.floor((ymin - startY) / (brickHeight + 2));
      let line2 = Math.floor((ymax - startY) / (brickHeight + 2));
      let bounce = false;
      let columnOffset = collisionColumn * bricksPerColumns * 3;
      let b1 = columnOffset + line1 * 3;
      let b2 = columnOffset + line2 * 3;
      let bricks = this.bricks;
      if (line1 >= 0 && bricks[b1 + 2] == 1) {
        g.setColor(g.getBgColor());
        let x = bricks[b1];
        let y = bricks[b1 + 1];
        g.fillRect(x, y, x + brickWidth, y + brickHeight);
        bricks[b1 + 2] = 0;
        bounce = true;
        this.score += collisionColumn * 10;
        this.remainingBricks -= 1;
      }
      if (line2 < bricksPerColumns && bricks[b2 + 2] == 1) {
        g.setColor(g.getBgColor());
        let x = bricks[b2];
        let y = bricks[b2 + 1];
        g.fillRect(x, y, x + brickWidth, y + brickHeight);
        bricks[b2 + 2] = 0;
        bounce = true;
        this.score += collisionColumn * 10;
        this.remainingBricks -= 1;
      }
      if (bounce) {
        ball.speedX = -ball.speedX;
      }
      if (this.remainingBricks == 0) {

        clearInterval(gameInterval);
        g.clear();
        g.setColor(0).setFont("Vector:28").setFontAlign(0, 0).drawString("Victory", g.getWidth()/2, g.getHeight()/2);
        return;
      }
    }

    // Reset the ball if it goes off the left side
    if (ball.x - ball.radius < 0) {
      ball.x = g.getWidth() / 2;
      ball.y = startY + availableHeight / 2;
      ball.speedX = 2;
      ball.speedY = 2;
      this.lives -= 1;
      let x = firstHeartX + this.lives * (heart.width + 4);
      g.setColor(g.getBgColor()).fillRect(x, 2, x+heart.width, 2+heart.height);
      if (this.lives == 0) {
        clearInterval(gameInterval);
        g.clear();
        g.setColor(0).setFont("Vector:28").setFontAlign(0, 0).drawString("Game Over", g.getWidth()/2, g.getHeight()/2-10);
        g.drawString("score: "+this.score, g.getWidth()/2, g.getHeight()/2+25);
        return;
      }
    }

    // Clear the old ball position
    this.drawBall(old_x, old_y, g.getBgColor());
    // Draw the new ball position
    this.drawBall(ball.x, ball.y, 1);
  }
}

Bangle.setOptions({ backlightTimeout: 0 }); // Disable backlight timeout

function startGame() {
  g.clear(); // Clear the screen
  game = new Game();
  setTimeout(() => {
    let y = 0;
    for (let i = 0; i < 100; i++) {
      y += Bangle.getAccel().y;
    }
    restingY = y / 100;
    // Set up an interval to update the game
    gameInterval = setInterval(updateGame, 50);
  }, 10);
}

function updateGame() {
  g.setColor(0, 0, 0).drawLine(0, topBorder, g.getWidth(), topBorder);
  game.updatePaddle();
  game.updateBall();
  g.flip();
}

startGame();

Bangle.on("touch", () => {
  if (game === null) {
    return;
  }
  if (game.lives == 0 || game.remainingBricks == 0) {
    startGame();
  }
});
