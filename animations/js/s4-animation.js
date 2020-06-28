// time
let t = 0;
let tInc = 0;

// GRADIENT
const GRAD_LENGTH = 100;
const GRAD_OFFSET = 50;
const SQUARE_SIZE = 450;

// FORMULA
let formula;
let fIndex;

// PROGRESS BAR
let step = 1;
const MAX_STEP = 20;

const SCROLL_INC = 150;
let pos = - SCROLL_INC;

function preload() {
  loadIcons();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  formula = select('#sumN');
  formula.style('font-size:1.6vw');
  fIndex = select('#fIndex');

  setOrigin(1);
  updateGraphics();
  setProgressGraphics(1, 1 / (MAX_STEP + 1));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  updateOrigin();
  updateGraphics();
  updateProgressGraphics();
}

function updateGraphics() {
  // move formula
  fIndex.html(`${step - 1}`);
  let fWidth = Math.trunc(formula.elt.offsetWidth);
  formula.position(xOrigin - fWidth / 2, yOrigin + 1.5 * scaleFactor);
}

function scrollIncrement(inc) {
  if (barTimer < 1) {
    anTimer = AN_MAX_TIME;
  }
  barTimer = BAR_MAX_TIME;
  barGradTimer = BAR_GRAD_MAX_TIME;

  let newPos = pos + inc;
  if (newPos <= - SCROLL_INC && newPos >= - SCROLL_INC * (MAX_STEP + 1)) {
    pos = newPos;
    step = Math.trunc(Math.abs(pos / SCROLL_INC));
  } else if (newPos > - SCROLL_INC) {
    pos = -SCROLL_INC;
  } else if (newPos < - SCROLL_INC * (MAX_STEP + 1)) {
    pos = - SCROLL_INC * (MAX_STEP + 1);
  }

  updateGraphics();
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
  for (let i = 0; i < GRAD_LENGTH; i++) {
    stroke(0, 255 - i * 255 / GRAD_LENGTH);
    line(xOrigin - scaleFactor * 1.5 - GRAD_OFFSET + i, yOrigin - scaleFactor * 1.5,
      xOrigin - scaleFactor * 1.5 - GRAD_OFFSET + i, yOrigin + scaleFactor * 1.5);
    line(xOrigin + scaleFactor * 1.5 + GRAD_OFFSET - i, yOrigin - scaleFactor * 1.5,
      xOrigin + scaleFactor * 1.5 + GRAD_OFFSET - i, yOrigin + scaleFactor * 1.5);
  }
  fill(0);
  noStroke();
  square(xOrigin - scaleFactor * 1.5 - GRAD_OFFSET - SQUARE_SIZE, yOrigin - scaleFactor * 1.5, SQUARE_SIZE);
  square(xOrigin + scaleFactor * 1.5 + GRAD_OFFSET, yOrigin - scaleFactor * 1.5, SQUARE_SIZE)

  // PROGRESS BAR & // MOUSE ICON
  let barProgr = Math.abs(pos) / (SCROLL_INC * (MAX_STEP + 1))
  drawProgressBar(barProgr);
  drawMouseIcon(barProgr, t);

  t += 0.01;

  if (t > TWO_PI) {
    path = [];
    t = 0;
  }

}

