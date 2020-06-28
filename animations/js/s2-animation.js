// TIME
let t = 0;
let tInc = 0;

// POLYNOMIAL IMAGE
let path = [];

// FORMULAS
let formulas = [];
let sumFormula;

// POLYNOMIAL
let polynomial = [];

let step = 1;
let maxStep;

// PROGRESS BAR
const SCROLL_INC = 150;
let pos = - SCROLL_INC;

// PROGRESS BAR (TOUCH)
let starPos;
let finalPos;

function preload() {
  loadIcons();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let pol = [[0.3, PI / 6, 0],
  [0.5, 0, 1], [0.3, HALF_PI, -1],
  [0.4, PI, 2], [0.2, PI / 4, -2]];

  maxStep = pol.length;

  setOrigin(1, maxStep);

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
  setProgressGraphics(1, 1 / (maxStep + 1));
}

function windowResized() {
  path = [];
  resizeCanvas(windowWidth, windowHeight);

  updateOrigin();
  updateGraphics();
  updateProgressGraphics();
}

function scrollIncrement(inc) {
  setTimers();

  let newPos = pos + inc;
  if (newPos < - SCROLL_INC && newPos > - SCROLL_INC * (maxStep + 1)) {
    pos = newPos;
    step = Math.trunc(Math.abs(pos / SCROLL_INC));
  } else if (newPos >= - SCROLL_INC) {
    pos = - SCROLL_INC;
    step = 1;
  } else if (newPos <= - SCROLL_INC * (maxStep + 1)) {
    pos = - SCROLL_INC * (maxStep + 1);
    step = maxStep;
  }
  updateGraphics();
}

/**
 * Update formulas position and path.
 */
function updateGraphics() {
  // path
  path = [];
  tInc = t % TWO_PI;

  // formulas
  for (let i = 0; i < step; i++) {
    formulas[i].style('display:inline-block;');
    formulas[i].style('font-size:1.6vw');

    let fWidth = formulas[i].elt.offsetWidth;
    formulas[i].position(x2Origin + polynomial[i].freq * distance - fWidth / 2,
      y2Origin + 1.25 * secScaleFactor);
  }
  for (let i = step; i < maxStep; i++) {
    formulas[i].style('display:none');
  }

  if (step > 1) {
    sumFormula.sum.style('display:inline-block');
    sumFormula.sum.style('font-size:1.6vw')
    sumFormula.maxIndex.html(`${Math.trunc(step / 2)}`);

    let fWidth = Math.trunc(sumFormula.sum.elt.offsetWidth);
    sumFormula.sum.position(xOrigin - fWidth / 2, yOrigin + 1.5 * scaleFactor);
  } else {
    sumFormula.sum.style('display:none');
  }
}

/**
 * Draw the trigonometric polynomial and its components.
 */
function drawPolynomial() {

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
  drawPolynomial();

  // PROGRESS BAR & MOUSE ICON
  let barProgr = (Math.abs(pos) / (SCROLL_INC * (maxStep + 1)));
  drawProgressBar(barProgr);
  drawMouseIcon(barProgr, t);

  t += 0.01;

  if (t > TWO_PI + tInc) {
    t = tInc;
    path = [];
  }

}

