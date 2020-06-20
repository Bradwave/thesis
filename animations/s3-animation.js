// time
let t = 0;
let tInc = 0;

// polinomial image
let path = [];

// main origin
let xOrigin = 0;
let yOrigin = 0;
let zOrigin = 0;

let scaleFactor = 100.000000;
let descaleFactor = 1.000000 / scaleFactor;

// secondary origin
let x2Origin;
let y2Origin;

// formula origin
let xfOrigin;
let yfOrigin;

let distance = 100;
let secScaleFactor = 40;
let secDescaleFactor = 1.000000 / secScaleFactor;

// formulas
let formulas = [];
let sumFormula;

// polynomial
let polynomial = [];
let maxStep;

// wheel scroll
const scrollInc = 1;
let minPos = 0;
let maxPos = 4 * scaleFactor;
let pos = minPos;
let oldPos = pos;
let newPos;
let trInc = 0;

// camera settings
let cs = {
  X: pos, Y: -pos, Z: 200,
  centerX: 0, centerY: 0, centerZ: 0,
  upX: 0, upY: 1, upZ: 0
};

// progress bar
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
  createCanvas(windowWidth, windowHeight, WEBGL);

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

  sumFormula = select('#sum');
  sumFormula.style('display:none');

  updateGraphics();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  setOrigin();
  updateGraphics();
}

function setOrigin() {
  let minDim = min(width, height);

  // main origin
  xOrigin = 0;
  yOrigin = 0.14 * minDim;

  scaleFactor = minDim / 7;
  descaleFactor = 1.000000 / scaleFactor;

  // secondary origin
  x2Origin = 0;
  y2Origin = - height * 0.34;

  distance = width / (maxStep);
  secScaleFactor = minDim / 15;
  secDescaleFactor = 1.000000 / secScaleFactor;

  // formula origin
  xfOrigin = width * 0.5;
  yfOrigin = height * 0.16;

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

function mouseWheel(event) {
  // progress bar gradient
  if (barTimer < 1) {
    anTimer = anMaxTime;
  }
  barTimer = barMaxTime;
  barGradTimer = barGradMaxTime;

  // position
  newPos = (pos + event.delta);
  if (newPos < minPos) {
    newPos = minPos;
  } else if (newPos > maxPos) {
    newPos = maxPos;
  }
  trInc = Math.abs(newPos - pos);
}

function updateGraphics() {
  // path
  path = [];
  tInc = t % (2 * TWO_PI);

  ortho();

  // formulas
  for (let i = 0; i < maxStep; i++) {
    formulas[i].style('display:inline-block');
    formulas[i].style('font-size:1.2em');

    let fWidth = formulas[i].elt.offsetWidth;
    formulas[i].position(xfOrigin + polynomial[i].freq * distance - fWidth / 2,
      yfOrigin + 1.25 * secScaleFactor);
  }

  sumFormula.style('display:inline-block');
  sumFormula.style('font-size:1.2em')

  let fWidth = Math.trunc(sumFormula.elt.offsetWidth);
  sumFormula.position(xfOrigin - fWidth / 2,
    height * 0.5 + min(width, height) * 0.14 + 1.5 * scaleFactor);


  // progress bar
  barHeight = 2 * scaleFactor;
  barYOffest = 2.3 * scaleFactor;
}

function drawPolinomial() {

  let p = new Complex([0, 0]);
  let ps = toScreenCoord(p.re, p.im);
  let ps2 = toSecondaryScreenCoord(p.re, p.im, 0);

  let prevPs;

  for (let n = 0; n < maxStep; n++) {

    // coefficient & frequency
    let coeff = polynomial[n].c;
    let freq = polynomial[n].freq;

    // ROTATING POINTS & LINES
    let tArg = new Complex([0, t * freq]);
    let newP = tArg.exp().mul(coeff);

    p = p.add(newP);

    prevPs = ps;
    ps = toScreenCoord(p.re, p.im);

    ps2 = toSecondaryScreenCoord(newP.re, newP.im, freq);

    // MAIN
    push();

    if (trInc >= 0.5) {
      trInc -= 0.5;

      pos += Math.sign(newPos - oldPos) * 0.5
      cs.X = pos;
      cs.Y = -pos;
    } else {
      oldPos = pos;
      trInc = 0;
    }

    camera(cs.X, cs.Y, cs.Z,
      cs.centerX, cs.centerY, cs.centerZ,
      cs.upX, cs.upY, cs.upZ);

    // main circle
    strokeWeight(1);
    stroke(100 - 50 * n / polynomial.length);
    ellipse(ps.x, ps.y, coeff.abs() * scaleFactor * 2);

    // main line
    line(prevPs.x, prevPs.y, 0, ps.x, ps.y, 0);

    pop();


    // SECONDARY
    let o2 = toSecondaryScreenCoord(0, 0, freq);

    // secondary circle
    stroke(100);
    strokeWeight(1);
    ellipse(o2.x, o2.y, coeff.abs() * secScaleFactor * 2);

    stroke(200 - 100 * n / polynomial.length);
    strokeWeight(1);

    // secondary line
    line(o2.x, o2.y, 0, ps2.x, ps2.y, 0);

    // secondary point
    stroke(150 - 75 * n / polynomial.length);
    strokeWeight(12 - 4 * n / polynomial.length);
    point(ps2.x, ps2.y, 2);

  }

  path.unshift(ps);

  push();

  camera(cs.X, cs.Y, cs.Z,
    cs.centerX, cs.centerY, cs.centerZ,
    cs.upX, cs.upY, cs.upZ);

  beginShape();
  noFill();
  strokeWeight(3);
  stroke(200);
  for (let i = 0; i < path.length; i++) {
    vertex(path[i].x, path[i].y, - i / 3);
  }
  endShape();

  stroke('green');
  strokeWeight(18);
  point(ps.x, ps.y, 2)

  pop();

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
  arc(windowWidth / 2 - 51, windowHeight / 2 - barHeight - barYOffest + 4, 8, 8, PI, 0);
  arc(windowWidth / 2 - 51, windowHeight / 2 - barYOffest - 4, 8, 8, 0, PI);
  rect(windowWidth / 2 - 55, windowHeight / 2 - barHeight - barYOffest + 4, 8, barHeight - 8);

  fill(255, alpha);

  progressHeight = (pos + 20) / (maxPos + 20) * barHeight;
  arc(windowWidth / 2 - 51, windowHeight / 2 - progressHeight - barYOffest + 4, 8, 8, PI, 0);
  arc(windowWidth / 2 - 51, windowHeight / 2 - barYOffest - 4, 8, 8, 0, PI);
  rect(windowWidth / 2 - 55, windowHeight / 2 - progressHeight - barYOffest + 4, 8, progressHeight - 8);
}

function drawMouseIcon() {
  push();

  scale(0.2);
  translate((windowWidth / 2 - 82) * 5, (windowHeight / 2 - barYOffest + 5) * 5);

  tint(255, 200);
  image(mwIcon, 0, 0)
  tint(255, 0.5 * (1 + sin(4 * t)) * 255);
  image(mwIconGlow, 0, 0)

  pop();
}

function draw() {
  background(0);

  smooth();

  // MAIN AXIS

  noFill();
  stroke(50);
  strokeWeight(1);

  push();

  camera(cs.X, cs.Y, cs.Z,
    cs.centerX, cs.centerY, cs.centerZ,
    cs.upX, cs.upY, cs.upZ);


  // x axis
  line(xOrigin - scaleFactor * 1.5, yOrigin, 0, xOrigin + scaleFactor * 1.5, yOrigin, 0);
  // y axis
  line(xOrigin, yOrigin - scaleFactor * 1.5, 0, xOrigin, yOrigin + scaleFactor * 1.5, 0);
  // z axis
  line(xOrigin, yOrigin, zOrigin, xOrigin, yOrigin, zOrigin - scaleFactor * 1.5);

  pop();

  // SECONDARY AXIS

  for (let i = 0; i < maxStep; i++) {
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

  if (t > 2 * TWO_PI + tInc) {
    t = tInc;
    path = [];
  }

}