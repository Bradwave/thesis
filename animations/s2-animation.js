// time
let t = 0;
let tInc = 0;

// polinomial image
let path = [];

// main origin
let xOrigin;
let yOrigin;

let scaleFactor = 200.000000;
let descaleFactor = 1.000000 / scaleFactor;

// secondary origin
let x2Origin;
let y2Origin;

let distance = 100;
let secScaleFactor = 40;
let secDescaleFactor = 1.000000 / secScaleFactor;

// formulas
let formulas = [];
let sumFormula;

// polynomial
let polynomial = [];

let step = 1;
let maxStep;

// progress bar
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

// mouse icon
let mwIcon;
let mwIconGlow;

function preload() {
  mwIcon = loadImage('https://bradwave.github.io/fourier-series/animations/icons/mw-icon.png');
  mwIconGlow = loadImage('https://bradwave.github.io/fourier-series/animations/icons/mw-icon-glow.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let pol = [[0.3, PI / 6, 0],
  [0.5, 0, 1], [0.3, HALF_PI, -1],
  [0.4, PI, 2], [0.2, PI / 4, -2]];

  maxStep = pol.length;

  setOrigin();

  for (let i = 0; i < pol.length; i++) {
    polynomial.push({
      c: new Complex({ phi: pol[i][1], r: pol[i][0] }),
      freq: pol[i][2]
    });

    let formula = select('#c' + i);
    formula.style('display:none');
    formulas.push(formula);
  }

  maxStep = polynomial.length;

  sumFormula = { sum: select('#sum'), maxIndex: select('#maxIndex') };
  sumFormula.sum.style('display:none');

  updateGraphics();
}

function windowResized() {
  path = [];
  resizeCanvas(windowWidth, windowHeight);

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

  // secondary origin
  x2Origin = width * 0.5;
  y2Origin = height * 0.16;

  distance = width / (maxStep);
  secScaleFactor = minDim / 15;
  secDescaleFactor = 1.000000 / secScaleFactor;

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

function toSecondaryScreenCoord(x, y, pos) {
  let sx = x * secScaleFactor + x2Origin + pos * distance;
  let sy = y2Origin - y * secScaleFactor;
  return createVector(sx, sy);
}

function keyPressed() {
  if (keyCode === 68) {
    if (step < maxStep) { step++; updateGraphics() };
  } else if (keyCode === 65) {
    if (step > 1) { step--; updateGraphics() };
  }
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
    updateGraphics();
  } else if (newPos <= scrollInc) {
    pos = scrollInc;
  } else if (newPos >= scrollInc * (maxStep + 1)) {
    pos = scrollInc * (maxStep + 1);
  }
}

function updateGraphics() {
  // path
  path = [];
  tInc = t % TWO_PI;

  // formulas
  for (let i = 0; i < step; i++) {
    formulas[i].style('display:inline-block');
    formulas[i].style('font-size:1.2em');

    let fWidth = formulas[i].elt.offsetWidth;
    formulas[i].position(x2Origin + polynomial[i].freq * distance - fWidth / 2,
      y2Origin + 1.25 * secScaleFactor);
  }
  for (let i = step; i < maxStep; i++) {
    formulas[i].style('display:none');
  }

  if (step > 1) {
    sumFormula.sum.style('display:inline-block');
    sumFormula.sum.style('font-size:1.2em')
    sumFormula.maxIndex.html(`${Math.trunc(step / 2)}`);

    let fWidth = Math.trunc(sumFormula.sum.elt.offsetWidth);
    sumFormula.sum.position(xOrigin - fWidth / 2, yOrigin + 1.5 * scaleFactor);
  } else {
    sumFormula.sum.style('display:none');
  }

  // progress bar
  barHeight = 2 * scaleFactor;
  barYOffest = 2.3 * scaleFactor;
}

function drawPolinomial() {

  let p = new Complex([0, 0]);
  let ps = toScreenCoord(p.re, p.im);
  let ps2 = toSecondaryScreenCoord(p.re, p.im, 0);

  let prevPs;

  for (let n = 0; n < step; n++) {

    // coefficient & frequency
    let coeff = polynomial[n].c;
    let freq = polynomial[n].freq;

    // CIRCLES

    strokeWeight(1);

    // main circle
    stroke(100 - 50 * n / polynomial.length);
    ellipse(ps.x, ps.y, coeff.abs() * scaleFactor * 2);
    // secondary circle
    let o2 = toSecondaryScreenCoord(0, 0, freq);
    stroke(100);
    ellipse(o2.x, o2.y, coeff.abs() * secScaleFactor * 2);

    // ROTATING POINTS & LINES
    let tArg = new Complex([0, t * freq]);
    let newP = tArg.exp().mul(coeff);

    p = p.add(newP);
    prevPs = ps;

    ps = toScreenCoord(p.re, p.im);
    ps2 = toSecondaryScreenCoord(newP.re, newP.im, freq);

    // LINES

    if (n == step - 1) {
      stroke('green')
    } else {
      stroke(100 - 50 * n / polynomial.length);
    }
    strokeWeight(2);

    // main line
    line(prevPs.x, prevPs.y, ps.x, ps.y);

    // secondary line
    line(o2.x, o2.y, ps2.x, ps2.y);

    // main point
    if (n == step - 1) {
      stroke(200);
      strokeWeight(6);
      point(ps.x, ps.y);
    }

    // secondary point
    stroke(150 - 75 * n / polynomial.length);
    strokeWeight(6 - 4 * n / polynomial.length);
    point(ps2.x, ps2.y);
  }

  path.unshift(ps);

  beginShape();
  noFill();
  strokeWeight(3);
  stroke(200);
  for (let i = 0; i < path.length; i++) {
    vertex(path[i].x, path[i].y);
  }
  endShape();

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

  // SECONDARY AXIS

  for (let i = 0; i < step; i++) {
    let freq = polynomial[i].freq;

    // x axis
    line(x2Origin - 1.5 * secScaleFactor + freq * distance, y2Origin,
      x2Origin + 1.5 * secScaleFactor + freq * distance, y2Origin);
    // y axis
    line(x2Origin + freq * distance, y2Origin - secScaleFactor * 1.5,
      x2Origin + freq * distance, y2Origin + secScaleFactor * 1.5);
  }

  // POLYNOMIAL
  drawPolinomial();

  // PROGRESS BAR
  drawProgressBar();

  // MOUSE WHEEL ICON
  drawMouseIcon();

  t += 0.01;

  if (t > TWO_PI + tInc) {
    t = tInc;
    path = [];
  }

}

