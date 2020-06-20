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

// formulas
let formulas = [];

// progress bar
let step = 1;
const maxStep = 20;

const scrollInc = 150;
let pos = scrollInc;

let barTimer = 0;
const barMaxTime = 120;
let barGradTimer = 0;
const barGradMaxTime = 120;
let anTimer = 0;
const anMaxTime = 30;

let barHeight = 2 * scaleFactor;
let progressHeight;
let barYOffest = 2.3 * scaleFactor;
let alpha;

// mouse icon
let mwIcon;
let mwIconGlow;

function preload() {
  mwIcon = loadImage('https://bradwave.github.io/fourier-series/animations/icons/mw-icon.png');
  mwIconGlow = loadImage('https://bradwave.github.io/fourier-series/animations/icons/mw-icon-glow.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let formula = select('#c0');
  formula.style('display:none');

  setOrigin();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  setOrigin();
}

function setOrigin() {
  let minDim = min(width, height);

  // main origin
  xOrigin = width * 0.5;
  yOrigin = height * 0.5 + minDim * 0.14;

  scaleFactor = minDim / 7;
  descaleFactor = 1.000000 / scaleFactor;

  // progress bar
  barHeight = 2 * scaleFactor;
  barYOffest = 2.3 * scaleFactor;
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
    anTimer = anMaxTime;
  }
  barTimer = barMaxTime;
  barGradTimer = barGradMaxTime;

  let newPos = pos + event.delta;
  if (newPos > scrollInc && newPos < scrollInc * (maxStep + 1)) {
    pos = newPos;
    step = Math.trunc(pos / scrollInc);
  }
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
  stroke('green');
  strokeWeight(10);
  point(p.x, p.y);
}

function drawProgressBar() {
  noStroke();

  alpha = 255;

  if (barTimer > 0) {
    barTimer--;
    if (anTimer > 0) {
      alpha = 255 - 255 * anTimer / anMaxTime;
      anTimer--;
    }
  } else {
    if (barGradTimer > 0) {
      barGradTimer--;
    }
    alpha = 255 * barGradTimer / barMaxTime;
  }

  fill(100, alpha);
  rect(windowWidth - 55, windowHeight - barHeight - barYOffest, 8, barHeight, 4);

  fill(255, alpha);
  progressHeight = pos / (scrollInc * (maxStep + 1)) * barHeight;
  rect(windowWidth - 55, windowHeight - progressHeight - barYOffest, 8, progressHeight, 4);
}

function drawMouseIcon() {
  push();

  scale(0.2);
  translate((windowWidth - 82) * 5, (windowHeight - barYOffest + 5) * 5);

  tint(255, 200);
  image(mwIcon, 0, 0)
  tint(255, 0.5 * (1 + sin(4 * t)) * 255);
  image(mwIconGlow, 0, 0)

  pop();
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

