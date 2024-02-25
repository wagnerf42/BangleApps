// constants for bricks positions...
const fps = 23; // frames displayed each second (also impact ball speed)
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
    g.setColor(g.getBgColor()).fillCircle(oldX, oldY, this.ball.radius);
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
          g.setColor(0).setFont("Vector:28").setFontAlign(0, 0).drawString("Victory", g.getWidth()/2, g.getHeight()/2-10);
          g.setFont("Vector:22").drawString("score: "+this.score, g.getWidth()/2, g.getHeight()/2+25);
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
    const ballColor = (ball.superBallStart === null)?1:"#FF0000";
    g.setColor(ballColor).fillCircle(ball.x, ball.y, ballRadius);
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
  // let start = getTime();
  game.updateBonus();
  // let t1 = getTime();
  game.updatePaddle();
  // let t2 = getTime();
  game.updateBall();
  // let t3 = getTime();
  g.flip();
  // let done_in = t3 - start;
  // if (done_in > 1/fps) {
  //   console.log("too slow:", done_in, "bonus", t1-start, "paddle", t2-t1, "ball", t3-t2);
  // }
}

//let's have an intro screen
let title = require("heatshrink").decompress(atob("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"));

startInterval = setInterval(() => {
    let frame = Math.floor(getTime() / 4) % 4;
    g.setFont("4x6:2").setFontAlign(0, 0, 0);
    let name = "";
    let contribution = "";
    if (frame == 0) {
      name = "Fred Wagner";
      contribution = "Code";
    } else if (frame == 2) {
      name = "Yann Wagner";
      contribution = "Gfx";
    }
    g.drawImage(title, 0, 0);
    g.setFontAlign(0, 0, 0);
    g.setColor(0, 0, 0);
    g.setFont("Vector:32").drawString("breakout", g.getWidth()/2, g.getHeight()/3);
    g.setFont("6x8:2");
    g.drawString(name, g.getWidth() / 2, (g.getHeight() * 2) / 3);
    g.drawString(contribution, g.getWidth() / 2, (g.getHeight() * 4) / 5);
    g.setColor(1, 0, 0);
    g.drawString(name, g.getWidth() / 2 - 1, (g.getHeight() * 2) / 3 - 1);
    g.drawString(
      contribution,
      g.getWidth() / 2 - 1,
      (g.getHeight() * 4) / 5 - 1
    );
    g.setFont("Vector:32").drawString("breakout", g.getWidth()/2 - 1, g.getHeight()/3 - 1);
    Bangle.setLocked(false);
}, 1000);

Bangle.on("touch", () => {
  if (game === null || game.lives == 0 || game.remainingBricks == 0) {
    if (game === null) {
      clearInterval(startInterval);
    }
  console.log("start");
    startGame();
  }
});
