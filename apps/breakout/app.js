// constants for bricks positions...
const fps = 22; // frames displayed each second (also impact ball speed)
const brickWidth = 10;
const numColumns = 5;
const ballRadius = 3;
const brickDistance = 2 * ballRadius;
const colors = ["#ff0000", "#ffa500", "#ffff00", "#00ff00", "#00ffff"];
const bonusColors = ["#ff0000", "#00ff00", "#0000ff"];

const topBorder = 16;
const availableHeight = g.getHeight() - topBorder;
const bricksPerColumns = 7;
const brickHeight = Math.floor((availableHeight - 2*(bricksPerColumns-1)) / bricksPerColumns);
const bonusHeight = 2*ballRadius;
const bonusWidth = bonusHeight;
let paddleHeight = 40;
const startY =
  topBorder +
  Math.floor((availableHeight - bricksPerColumns * (brickHeight + 2) + 2) / 2);
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
const firstHeartX = Math.floor(g.getWidth() * 3 / 5);

const LEVELS = [
  Uint8Array([
    1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,
    1,1,1,1,1,1,1
  ]),
  Uint8Array([
    2,2,2,2,2,2,2,
    1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,
    1,1,1,1,1,1,1
  ]),
  Uint8Array([
    1,1,1,1,1,1,1,
    1,2,1,2,1,2,1,
    3,1,3,1,3,1,3,
    1,2,1,2,1,2,1,
    1,1,1,1,1,1,1
  ])
];

// Adjust this value based on the accelerometer reading when the watch is at rest vertically
let restingAngle = 0;
let game = null;
let gameInterval;

class Game {
  constructor() {
    this.lives = 3;
    this.score = 0;
  }

  displayBrick(column, line) {
    let brickIndex = (column*bricksPerColumns+line) * 3;
    let active = this.bricks[brickIndex+2];
    let color;
    if (active == 0) {
      color = null;
    } else if (active == 1) {
      color = colors[column];
    } else if (active == 2) {
      color = "#808080";
    } else if (active == 3) {
      color = "#5A5A5A";
    }
    if (color !== null) {
      let x = this.bricks[brickIndex];
      let y = this.bricks[brickIndex + 1];
      g.setColor(color);
      g.fillRect(x, y, x + brickWidth, y + brickHeight);
    }
  }

  loadLevel(level) {
    this.level = level;
    this.redrawnBricks = [];
    this.remainingBricks = numColumns * bricksPerColumns;
    paddleHeight = 40;
    this.paddleY = topBorder + availableHeight / 2;
    this.paddleSpeed = 0;
    this.ball = {
      x: g.getWidth() / 2, // Initial X position of the ball
      y: this.paddleY, // Initial Y position of the ball
      radius: ballRadius, // Radius of the ball
      speedX: 2, // Initial speed of the ball along the X-axis
      speedY: 2, // Initial speed of the ball along the Y-axis
      superBallStart: null, // Are we a superball and since when ?
    };
    this.bonus = null;

    let bricks = new Uint8Array(numColumns * bricksPerColumns * 3);

    // Initialize bricks
    let c = 0;
    let columnX = firstColumnX;
    level = LEVELS[this.level];
    for (let i = 0; i < numColumns; i++) {
      for (let j = 0; j < bricksPerColumns; j++) {
        let y = startY + j * (brickHeight + 2);
        bricks[c] = columnX;
        bricks[c + 1] = y;
        let brickType = level[i*bricksPerColumns+j];
        bricks[c + 2] = brickType;
        if (brickType == 3 || brickType == 0) {
          // we do not need to destroy indestructible
          // or non-existing bricks
          this.remainingBricks -= 1;
        }
        c += 3;
      }
      columnX += detectionWidth;
    }
    this.bricks = bricks;
    this.firstColumnIndex =
      (this.bricks[0] - columnsOffset - this.ball.radius) / detectionWidth;
    this.initialDisplay();
    gameInterval = setInterval(updateGame, 1000/fps);
  }

  drawPaddle(color) {
    g.setColor(color);
    g.fillRect(2, this.paddleY, 5, this.paddleY + paddleHeight);
  }

  drawBall(x, y, color) {
    g.setColor(color);
    g.fillCircle(x, y, this.ball.radius);
  }
  
  drawInfo() {
    g.setColor(0).setFontAlign(-1, -1).setFont("6x8:2").drawString("lvl "+this.level, 10, 0);
    for(let i = 0 ; i < this.lives ; i++) {
      g.drawImage(heart, firstHeartX + i*(heart.width+4), 3);
    }
    g.setColor(0, 0, 0).drawLine(0, topBorder-2, g.getWidth(), topBorder);
  }

  initialDisplay() {
    g.clear();
    this.drawInfo();
    for (let i = 0; i < numColumns; i++) {
      for (let j = 0; j < bricksPerColumns; j++) {
        this.displayBrick(i, j)
      }
    }
  }

  updatePaddle() {
    // Get accelerometer data
    const angle = rawAngle();
    let tilt = angle - restingAngle;
    if (tilt > Math.PI) { tilt -= 2*Math.PI }
    if (tilt < -Math.PI) { tilt += 2*Math.PI }

    // Clear the old paddle position
    this.drawPaddle(g.getBgColor());

    // Adjust paddle speed based on watch tilt
    this.paddleSpeed = tilt * 30; // You can adjust the multiplier for sensitivity

    const oldY = this.paddleY;
    // Adjust paddle position based on accelerometer data
    this.paddleY += this.paddleSpeed;

    // Ensure the paddle stays within the screen boundaries
    this.paddleY = Math.max(
      topBorder,
      Math.min(g.getHeight() - paddleHeight, this.paddleY)
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

  brickCollision(brickIndex, collisionColumn, line) {
    let bricks = this.bricks;
    let x = bricks[brickIndex];
    let y = bricks[brickIndex + 1];
    let brickStatus = bricks[brickIndex+2];
    let bouncing = true;
    if (brickStatus == 1 || (brickStatus == 2 && this.ball.superBallStart !== null)) {
      this.score += collisionColumn * (availableHeight - paddleHeight);
      this.remainingBricks -= 1;
      bricks[brickIndex + 2] = 0;
      if (this.bonus === null && Math.random() < 0.25) {
        let type = Math.floor(Math.random() * 3);
        this.bonus = {
          rect: {x: x, y: y+bonusHeight, w: bonusWidth, h: bonusHeight},
          type: type, color: bonusColors[type], line: line };
      }
      if (this.ball.superBallStart !== null) {
        bouncing = false;
      }
    } else {
      this.redrawnBricks.push(brickIndex);
    }
    if (brickStatus == 2 && this.ball.superBallStart === null) {
      bricks[brickIndex + 2] -= 1;
    }
    g.setColor(g.getBgColor());
    g.fillRect(x, y, x + brickWidth, y + brickHeight);
    if (this.ball.x > x + brickWidth/2) {
      // if we touch on the right and come from the right we bounce
      return (bouncing && this.ball.speedX < 0);
    } else {
      // if we touch on the left and come from the left we bounce
      return (bouncing && this.ball.speedX > 0);
    }
  }

  redrawBricks() {
    let bricks = this.bricks;
    let n = this.redrawnBricks.length;
    for (let i = 0 ; i < n ; i++) {
      let brickIndex = this.redrawnBricks.pop();
      if (bricks[brickIndex+2] == 3) {
        g.setColor("#5A5A5A");
      } else {
        let collisionColumn = Math.floor(brickIndex / (3*bricksPerColumns));
        g.setColor(colors[collisionColumn]);
      }
      let x = bricks[brickIndex];
      let y = bricks[brickIndex + 1];
      g.fillRect(x, y, x + brickWidth, y + brickHeight);
    }
  }
  
  updateBonus() {
    if (this.bonus === null) {
      return;
    }
    
    g.setColor(g.getBgColor()).fillRect(this.bonus.rect);

    let collisionColumn =
      Math.floor((this.bonus.rect.x + bonusWidth/2 - columnsOffset) / detectionWidth) -
      this.firstColumnIndex;

    if (collisionColumn >= 0 && collisionColumn < numColumns) {
      this.displayBrick(collisionColumn, this.bonus.line);
    }

    const newX = this.bonus.rect.x - 3;
    // see if we exit the screen
    if (newX + bonusWidth < 0) {
      this.bonus = null;
      return;
    }
    // see if we touch the paddle
    if (newX < 5 && newX + bonusWidth > 2) {
      if (this.bonus.rect.y < this.paddleY + paddleHeight && this.bonus.rect.y > this.paddleY) {
        this.drawPaddle(g.getBgColor());
        if (this.bonus.type == 0) {
          // shrink paddle
          if (paddleHeight > 2) {
            paddleHeight -= 6;
            this.paddleY += 3;
          }
        } else if (this.bonus.type == 1) {
          // grow paddle
          paddleHeight += 6;

          this.paddleY -= 3;
          this.paddleY = Math.max(
            topBorder,
            Math.min(g.getHeight() - paddleHeight, this.paddleY)
          );

        } else {
          // super ball
          this.ball.superBallStart = getTime();
        }
        this.drawPaddle(1);
        this.bonus = null;
        return;
      }
    }
    // redraw in new position
    this.bonus.rect.x = newX;
    g.setColor(this.bonus.color).fillRect(this.bonus.rect);
  }

  updateBall() {
    let ball = this.ball;
    if (ball.superBallStart !== null && getTime() - ball.superBallStart > 5) {
      ball.superBallStart = null;
    }
    let oldX = ball.x;
    let oldY = ball.y;
    // Clear the old ball position
    this.drawBall(oldX, oldY, g.getBgColor());
    this.redrawBricks();
    if (oldY - ball.radius <= topBorder) {
      this.drawInfo();
    }

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
      ball.y > this.paddleY &&
      ball.y < this.paddleY + 40
    ) {
      ball.speedX = Math.abs(ball.speedX);
      ball.speedY += this.paddleSpeed * 0.3;
    }

    // Check collision with bricks
    let collisionColumn =
      Math.floor((ball.x - columnsOffset) / detectionWidth) -
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
      if (line1 >= 0 && line1 < bricksPerColumns && bricks[b1 + 2] >= 1) {
        bounce = this.brickCollision(b1, collisionColumn, line1);
      }
      if (line1 != line2 && line2 >= 0 && line2 < bricksPerColumns && bricks[b2 + 2] >= 1) {
        bounce = bounce || this.brickCollision(b2, collisionColumn, line2);
      }
      if (bounce) {
        ball.speedX = -ball.speedX;
      }
      if (this.remainingBricks == 0) {
        clearInterval(gameInterval);
        if (this.level < LEVELS.length-1) {
          this.loadLevel(this.level+1);
        } else {
          g.clear();
          g.setColor(0).setFont("Vector:28").setFontAlign(0, 0).drawString("Victory", g.getWidth()/2, g.getHeight()/2);
          Bangle.setLocked(false);
        }
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
      this.drawPaddle(g.getBgColor());
      paddleHeight = 40;
      if (this.lives == 0) {
        clearInterval(gameInterval);
        g.clear();
        g.setColor(0).setFont("Vector:28").setFontAlign(0, 0).drawString("Game Over", g.getWidth()/2, g.getHeight()/2-10);
        g.setFont("Vector:22").drawString("score: "+this.score, g.getWidth()/2, g.getHeight()/2+25);
        Bangle.setLocked(false);
        return;
      }
    }

    // Draw the new ball position
    let ballColor = (ball.superBallStart === null)?1:"#FF0000";
    this.drawBall(ball.x, ball.y, ballColor);
  }
}

Bangle.setOptions({ backlightTimeout: 0 }); // Disable backlight timeout

function rawAngle() {
  "jit";
  let acc = Bangle.getAccel();
  return Math.atan2(acc.y, acc.z);
}

function startGame() {
  game = new Game();
  setTimeout(() => {
    let anglesSum = 0;
    for (let i = 0; i < 100; i++) {
      anglesSum += rawAngle();
    }
    restingAngle = anglesSum / 100;
    game.loadLevel(0);
  }, 10);
}

function updateGame() {
  let start = getTime();
  game.updateBonus();
  let t1 = getTime();
  game.updatePaddle();
  let t2 = getTime();
  game.updateBall();
  let t3 = getTime();
  g.flip();
  let done_in = t3 - start;
  if (done_in > 1/fps) {
    console.log("too slow:", done_in, "bonus", t1-start, "paddle", t2-t1, "ball", t3-t2);
  }
}

startGame();

Bangle.on("touch", () => {
  if (game === null) {
    return;
  }
  if (game.lives == 0 || game.remainingBricks == 0) {
    startGame(2);
  }
});
