// time
let t = 0;

// polinomial image
let path = [];
let remove = false;

// main origin
let xOrigin;
let yOrigin;

let scaleFactor = 200.000000;
let descaleFactor = 1.000000 / scaleFactor;

// polynomial
let pol = [];
let polynomial = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  setOrigin();

  /* */
  pol = [[0.5, 0, 0],
  [0.3, PI, 1], [0.6, PI, -1],
  [0.4, 3 / 2 * PI, 2], [0.2, 3 / 2 * PI, -2],
  [0.1, -PI, 3], [0.2, -PI, -3],
  [0.2, -3 / 2 * PI, 4], [0.2, -3 / 2 * PI, -4]];
  /**/
  polynomial = [];
  for (let i = 0; i < pol.length; i++) {
    polynomial.push({
      c: new Complex({ phi: pol[i][1], r: pol[i][0] }),
      freq: pol[i][2]
    });
  }

  updateGraphics();
}

function setPolynomial() {
  pol = [];
  const maxPol = Math.random() * 12;
  for (let i = 0; i < maxPol; i++) {
    pol.push([Math.random() * 0.5 * (1 - i / maxPol), Math.random() * TWO_PI, i]);
    pol.unshift([Math.random() * 0.5 * (1 - i / maxPol), Math.random() * TWO_PI, -i])
  }

  polynomial = [];
  for (let i = 0; i < pol.length; i++) {
    polynomial.push({
      c: new Complex({ phi: pol[i][1], r: pol[i][0] }),
      freq: pol[i][2]
    });
  }
  polynomial.sort((a, b) => b.c.abs() - a.c.abs());
}

function mouseClicked() {
  updateGraphics();
  setPolynomial();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  setOrigin();
  updateGraphics();
}

function updateGraphics() {
  path = [];
  t = 0;
  remove = false;
}

function setOrigin() {
  let minDim = min(width, height);

  // main origin
  xOrigin = width * 0.5;
  yOrigin = height * 0.5;

  scaleFactor = minDim / 4;
  descaleFactor = 1.000000 / scaleFactor;
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

function drawPolynomial() {

  let p = new Complex([0, 0]);
  let ps = toScreenCoord(p.re, p.im);

  let prevPs;

  for (let n = 0; n < polynomial.length; n++) {

    // coefficient & frequency
    let coeff = polynomial[n].c;
    let freq = polynomial[n].freq;

    if (n > 0) {
      // CIRCLES

      strokeWeight(1);
      noFill();

      // main circle
      stroke(70 - 50 * n / polynomial.length);
      ellipse(ps.x, ps.y, coeff.abs() * scaleFactor * 2);


      // ROTATING POINTS & LINES
      let tArg = new Complex([0, t * freq]);
      let newP = tArg.exp().mul(coeff);

      p = p.add(newP);
      prevPs = ps;

      ps = toScreenCoord(p.re, p.im);

      // LINES

      stroke(70 - 50 * n / polynomial.length);
      strokeWeight(2);

      // main line
      line(prevPs.x, prevPs.y, ps.x, ps.y);
    }
  }

  path.unshift(ps);

  // path
  noFill();
  for (let i = 0; i < path.length - 1; i++) {
    strokeWeight(3 - 2 * i / path.length);
    stroke((-Math.pow(i / path.length, 2) + 1) * 200);
    line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
  }

  // main point
  stroke(200);
  strokeWeight(6);
  point(ps.x, ps.y);

}

function draw() {
  background(0);
  smooth();

  drawPolynomial();

  t += 0.01;

  if (t > TWO_PI) {
    t = 0;
    remove = true;
  }

  if (remove) {
    path.pop();
  }

}