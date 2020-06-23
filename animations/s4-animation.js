// time
let t = 0;
let tInc = 0;

// main origin
let xOrigin;
let yOrigin;

let scaleFactor = 200.000000;
let descaleFactor = 1.000000 / scaleFactor;

// gradient
const gradLength = 100;
const gradOffset = 50;
const squareSize = 450;

// formula
let formula;
let fIndex;

// progress bar
let step = 1;
const MAX_STEP = 20;

const SCROLL_INC = 150;
let pos = - SCROLL_INC;

let barTimer = 0;
const BAR_MAX_TIME = 120;
let barGradTimer = 0;
const BAR_GRAD_MAX_TIME = 120;
let anTimer = 0;
const AN_MAX_TIME = 30;

let barHeight = 240;
const BAR_WIDTH = 8;
let progressHeight;
let barYOffset = 240;
let barXOffset = 55;

// mouse icon
let mwIcon;
let arrowUp;
let arrowDown;
let wheelGlow;
let arrowUpGlow;
let arrowDownGlow;

let imgX;
let imgY;
let mwIconWidth;
let mwIconHeight;

let imgsLink = 'https://bradwave.github.io/fourier-series/animations/icons/';

function loadIcons() {
  mwIcon = loadImage(imgsLink + 'mw-icon.png', function () {
    mwIcon.resize(0, mwIconHeight);
    mwIconHeight = windowHeight / 6;
    mwIconWidth = mwIconHeight * mwIcon.width / mwIcon.height;
    imgX = windowWidth - barXOffset - mwIconWidth / 2 + BAR_WIDTH / 2;
    imgY = windowHeight - barYOffset + 5;
  });
  arrowUp = loadImage(imgsLink + 'arrow-up.png', function () {
    arrowUp.resize(0, mwIconHeight);
  });
  arrowDown = loadImage(imgsLink + 'arrow-down.png', function () {
    arrowDown.resize(0, mwIconHeight);
  });
  wheelGlow = loadImage(imgsLink + 'wheel-glow.png', function () {
    wheelGlow.resize(0, mwIconHeight);
  });
  arrowUpGlow = loadImage(imgsLink + 'arrow-up-glow.png', function () {
    arrowUpGlow.resize(0, mwIconHeight);
  });
  arrowDownGlow = loadImage(imgsLink + 'arrow-down-glow.png', function () {
    arrowDownGlow.resize(0, mwIconHeight);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  formula = select('#SumN');
  fIndex = select('#fIndex');

  loadIcons();
  setOrigin();
  updateGraphics();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  loadIcons();
  setOrigin();
  updateGraphics();
}

function setOrigin() {
  let minDim = min(width, height);

  // main origin
  xOrigin = width * 0.5;
  yOrigin = height * 0.5 + minDim * 0.14;

  scaleFactor = minDim / 7;
  descaleFactor = 1.000000 / scaleFactor;
}

function updateGraphics() {
  // move formula
  let fWidth = Math.trunc(formula.elt.offsetWidth);
  formula.position(xOrigin - fWidth / 2, yOrigin + 1.5 * scaleFactor);

  // progress bar
  barHeight = windowHeight / 3;
  barYOffset = windowHeight / 3;
  barXOffset = windowWidth / 40 + 25;

  // icons
  mwIconHeight = windowHeight / 6;
  mwIconWidth = mwIconHeight * mwIcon.width / mwIcon.height;
  imgX = windowWidth - barXOffset - mwIconWidth / 2 + BAR_WIDTH / 2;
  imgY = windowHeight - barYOffset + 5;
}

function toCartesian(x, y) {
  let cx = (x - xOrigin) * descaleFactor;
  let cy = (yOrigin - y) * descaleFactor;
  return createVector(cx, cy);
}

function toScreenCoord(x, y) {
  let sx = x * scaleFactor + xOrigin;
  let sy = yOrigin - y * scaleFactor;
  return createVector(sx, sy);
}

function mouseWheel(event) {
  if (barTimer < 1) {
    anTimer = AN_MAX_TIME;
  }
  barTimer = BAR_MAX_TIME;
  barGradTimer = BAR_GRAD_MAX_TIME;

  let newPos = pos + event.delta;
  if (newPos <= - SCROLL_INC && newPos >= - SCROLL_INC * (MAX_STEP + 1)) {
    pos = newPos;
    step = Math.trunc(Math.abs(pos / SCROLL_INC));
  } else if (newPos > - SCROLL_INC) {
    pos = -SCROLL_INC;
  } else if (newPos < - SCROLL_INC * (MAX_STEP + 1)) {
    pos = - SCROLL_INC * (MAX_STEP + 1);
  }

  fIndex.html(`${step - 1}`);
}

function drawSquareSignal() {

  let points = [toScreenCoord(-HALF_PI, -0.5),
  toScreenCoord(0, -0.5), toScreenCoord(0, 0.5),
  toScreenCoord(HALF_PI, 0.5), toScreenCoord(HALF_PI, -0.5),
  toScreenCoord(PI, -0.5), toScreenCoord(PI, 0.5),
  toScreenCoord(PI + HALF_PI, 0.5),]

  noFill();
  stroke(100);
  strokeWeight(2);

  push();

  translate(-t * scaleFactor / 2, 0);

  beginShape();
  for (let i = 0; i < points.length; i++) {
    vertex(points[i].x, points[i].y);
  }
  endShape();

  pop();
}

function drawApprossimation() {
  let p;
  let sineSum = 0;

  noFill();
  stroke(255);
  strokeWeight(2);

  push();

  translate(-t * scaleFactor / 2, 0);

  beginShape();
  for (let j = -HALF_PI; j < PI + HALF_PI; j += 0.005) {
    sineSum = 0;
    for (let k = 0; k < step; k++) {
      sineSum += 1.000 / (2 * k + 1) * sin((2 * k + 1) * 2 * j);
    }
    p = toScreenCoord(j, 2 / PI * sineSum);
    vertex(p.x, p.y);
  }
  endShape();

  pop();

  sineSum = 0;
  for (let k = 0; k < step; k++) {
    sineSum += 1.000 / (2 * k + 1) * sin((2 * k + 1) * 2 * t / 2);
  }
  p = toScreenCoord(0, 2 / PI * sineSum);
  stroke(233, 199, 6);
  strokeWeight(10);
  point(p.x, p.y);
}

function drawProgressBar() {
  noStroke();

  alpha = 255;

  if (barTimer > 0) {
    barTimer--;
    if (anTimer > 0) {
      alpha = 255 - 255 * anTimer / AN_MAX_TIME;
      anTimer--;
    }
  } else {
    if (barGradTimer > 0) {
      barGradTimer--;
    }
    alpha = 255 * barGradTimer / BAR_MAX_TIME;
  }

  fill(100, alpha);
  rect(windowWidth - barXOffset, windowHeight - barHeight - barYOffset, BAR_WIDTH, barHeight, BAR_WIDTH / 2);

  fill(255, alpha);
  progressHeight = Math.abs(pos) / (SCROLL_INC * (MAX_STEP + 1)) * barHeight;
  rect(windowWidth - barXOffset, windowHeight - progressHeight - barYOffset, BAR_WIDTH, progressHeight, BAR_WIDTH / 2);
}

function drawMouseIcon() {
  let oscillation = 0.5 * (1 + sin(4 * t));

  // mouse icon + wheel
  tint(255, 255);
  image(mwIcon, imgX, imgY);

   // arrow up
  if (pos > - SCROLL_INC * (MAX_STEP + 1)) {
    tint(255, 255);
    image(arrowUp, imgX, imgY - oscillation * 5);
    tint(255, oscillation * 255);
    image(arrowUpGlow, imgX, imgY - oscillation * 5);
  }

  // arrow down
  if (pos < - SCROLL_INC) {
    tint(255, 255);
    image(arrowDown, imgX, imgY + oscillation * 5);
    tint(255, oscillation * 255);
    image(arrowDownGlow, imgX, imgY + oscillation * 5);
  }

  // wheel glow
  tint(255, oscillation * 255);
  image(wheelGlow, imgX, imgY);
}

function draw() {

  background(0);

  // MAIN AXIS

  noFill();
  stroke(50);
  strokeWeight(1);

  // x axis
  line(xOrigin - scaleFactor * 1.5, yOrigin, xOrigin + scaleFactor * 1.5, yOrigin);
  // y axis
  line(xOrigin, yOrigin - scaleFactor * 1.5, xOrigin, yOrigin + scaleFactor * 1.5);

  // SQUARE SIGNAL
  drawSquareSignal();

  // APPROSSIMATION
  drawApprossimation();

  // GRADIENT + RECT
  for (let i = 0; i < gradLength; i++) {
    stroke(0, 255 - i * 255 / gradLength);
    line(xOrigin - scaleFactor * 1.5 - gradOffset + i, yOrigin - scaleFactor * 1.5,
      xOrigin - scaleFactor * 1.5 - gradOffset + i, yOrigin + scaleFactor * 1.5);
    line(xOrigin + scaleFactor * 1.5 + gradOffset - i, yOrigin - scaleFactor * 1.5,
      xOrigin + scaleFactor * 1.5 + gradOffset - i, yOrigin + scaleFactor * 1.5);
  }
  fill(0);
  noStroke();
  square(xOrigin - scaleFactor * 1.5 - gradOffset - squareSize, yOrigin - scaleFactor * 1.5, squareSize);
  square(xOrigin + scaleFactor * 1.5 + gradOffset, yOrigin - scaleFactor * 1.5, squareSize)

  // PROGRESS BAR
  drawProgressBar();

  // MOUSE WHEEL ICON
  drawMouseIcon();

  t += 0.01;

  if (t > TWO_PI) {
    // t = tInc;
    path = [];
    t = 0;
  }

}

