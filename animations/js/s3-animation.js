// TIME
let t = 0;
let tInc = 0;

// ORIGIN
zOrigin = 0;

// POLYNOMIAL IMAGE
let path = [];

// FORMULAS
let formulas = [];
let sumFormula;

// POLYNOMIAL
let polynomial = [];
let maxStep;

// WHEEL SCROLL
const MIN_POS = 0;
const MAX_POS = 400;
let pos = MIN_POS;
let oldPos = pos;
let newPos;
let trInc = 0;

// CAMERA SETTINGS
let cs = {
  X: pos, Y: -pos, Z: 200,
  centerX: 0, centerY: 0, centerZ: 0,
  upX: 0, upY: 1, upZ: 0
};

function preload() {
  loadIcons();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  let pol = [[0.3, PI / 6, 0],
  [0.5, 0, 1], [0.3, HALF_PI, -1],
  [0.4, PI, 2], [0.2, PI / 4, -2]];

  maxStep = pol.length;

  setOrigin(0, maxStep);

  for (let i = 0; i < pol.length; i++) {
    polynomial.push({
      c: new Complex({ phi: pol[i][1], r: pol[i][0] }),
      freq: pol[i][2]
    });

    let formula = select('#c' + i);
    formula.style('display:none');
    formulas.push(formula);
  }

  sumFormula = select('#sum');
  sumFormula.style('display:none');

  updateGraphics();
  setProgressGraphics(0.5, (MIN_POS + 20) / (MAX_POS + 20));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  updateOrigin();
  updateGraphics();
  updateProgressGraphics();
}

function scrollIncrement(inc) {
  setTimers();

  // position
  newPos = pos - inc;
  if (newPos <= MIN_POS) {
    newPos = MIN_POS;
  } else if (newPos >= MAX_POS) {
    newPos = MAX_POS;
  }
  trInc = Math.abs(newPos - pos);
}

/**
 * Update formulas position and path.
 */
function updateGraphics() {
  // path
  path = [];
  tInc = t % (2 * TWO_PI);

  ortho();

  // formulas
  for (let i = 0; i < maxStep; i++) {
    formulas[i].style('display:inline-block');
    formulas[i].style('font-size:22px');

    let fWidth = formulas[i].elt.offsetWidth;
    formulas[i].position(xfOrigin + polynomial[i].freq * distance - fWidth / 2,
      yfOrigin + 1.25 * secScaleFactor);
  }

  sumFormula.style('display:inline-block');
  sumFormula.style('font-size:22px');

  let fWidth = Math.trunc(sumFormula.elt.offsetWidth);
  sumFormula.position(xfOrigin - fWidth / 2,
    height * 0.5 + min(width, height) * 0.14 + 1.5 * scaleFactor);
}

function drawPolynomial() {

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
  drawPolynomial();

  // PROGRESS BAR & MOUSE ICON
  let barProgr = Math.abs((pos + 20) / (MAX_POS + 20));
  drawProgressBar(barProgr);
  drawMouseIcon(barProgr, t);

  t += 0.01;

  if (t > 2 * TWO_PI + tInc) {
    t = tInc;
    path = [];
  }

}