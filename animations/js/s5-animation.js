// TIME
let t = 0;
let tInc = 0;
let remove = false;

// BEZIER & FOURIER
let bezier;
let sampledPoints;

let fourier;
let N;
let dt;

const PATH_COLOR = 140;
let polColor;

const MIN_DISTANCE = 4;
const MIN_RADIUS = 3;
const SKIP = 0;

let usedFreq = 1;
let progr;

// SPECTRUM
const MAX_SPECTRUM_FREQ = 20;
let maxFreq;

// UPDATE TIMER
let updateTimer = 0;
const UPDATE_MAX_TIME = 4;
const FIRST_HEAVY_FREQ = 100;

// PATHS  
let path = [];
let polPath = [];

// PROGRESS BAR
const MIN_POS = -50;
const MAX_POS = -2000;
let pos = MIN_POS;

// PROGRESS BAR (TOUCH)
let starPos;
let finalPos;

// BEZIER & FOURIER FUNCTIONS 

/**
 * Reorders the Fourier coefficients.
 */
function reorder() {
  for (let k = 1; k < N / 2; k++) {
    let temp = fourier[k];
    fourier[k] = fourier[k + N / 2];
    fourier[k + N / 2] = temp;
  }
}

/**
 * Scales and offsets the Bezier curve. 
 * @param {Number} factor Scale factor.
 * @param {Number} xOffset Offset on the x axis.
 * @param {Number} yOffset Offset on the y axis.
 */
function rescaleAndOffset(factor, xOffset, yOffset) {
  for (let k = 0; k < sampledPoints.length; k++) {
    sampledPoints[k].re = sampledPoints[k].re * factor + xOffset;
    sampledPoints[k].im = sampledPoints[k].im * factor + yOffset;
  }
  for (let k = 0; k < bezier.points.length; k++) {
    bezier.points[k].x = bezier.points[k].x * factor + xOffset;
    bezier.points[k].y = bezier.points[k].y * factor + yOffset;
  }
}

// GRAPHICS FUNCTIONS

function preload() {
  loadIcons();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  polColor = color(66, 175, 250);
  // drawingContext.shadowColor = polColor;
  frameRate(30);

  setOrigin(1, MAX_SPECTRUM_FREQ * 2);

  bezier = new Polybezier(mole);
  sampledPoints = bezier.samplePoints(10);
  rescaleAndOffset(1.3, 0, 0.5);

  console.log("# sampled points = " + sampledPoints.length);

  fourier = dft(sampledPoints);
  N = fourier.length;
  dt = TWO_PI / N;

  reorder();

  updateGraphics();
  setProgressGraphics(1, MIN_POS / MAX_POS);
}

function windowResized() {
  path = [];
  updateTimer = UPDATE_MAX_TIME;
  resizeCanvas(windowWidth, windowHeight);

  updateOrigin();
  updateGraphics();
  updateProgressGraphics();
}

function scrollIncrement(inc) {
  setTimers();

  let newPos = pos + inc;
  if (newPos < MIN_POS && newPos > MAX_POS) {
    pos = newPos;
    progr = Math.pow(pos / MAX_POS, 4);
  } else if (newPos >= MIN_POS) {
    pos = MIN_POS;
    progr = 0;
  } else if (newPos <= MAX_POS) {
    pos = MAX_POS;
    progr = 1;
  }

  let prevUsed = usedFreq;
  usedFreq = Math.round(progr * 0.4 * N + 1);
  if (usedFreq > FIRST_HEAVY_FREQ) {
    updateTimer = Math.round(progr * UPDATE_MAX_TIME);
  } else {
    updateTimer = 0;
  }
  if (usedFreq != prevUsed) {
    maxFreq = Math.min(usedFreq, MAX_SPECTRUM_FREQ);
    console.log(maxFreq);
    updateGraphics();
  }
}

/**
 * Update path and time.
 */
function updateGraphics() {
  polPath = [];
  tInc = t % TWO_PI;
  remove = false;
}

// PATHS FUNCTIONS

/**
 * Calculate the path traced by the partial sum of the Fourier series.
 */
function calcPath() {
  path = [];

  let ps = toScreenCoord(0, 0);

  for (let time = 0; time < TWO_PI; time += dt) {
    let x = 0;
    let y = 0;

    for (let n = 0; n < N; n++) {
      let freq = fourier[n].freq;
      if (freq < usedFreq + 1 || freq > N - usedFreq - 1) {
        radius = fourier[n].amp;
        phase = fourier[n].phase;

        x += radius * Math.cos(freq * time + phase);
        y += radius * Math.sin(freq * time + phase);
      }
    }

    ps = toScreenCoord(x, y);
    path.unshift(ps);
  }
}

/**
 * Draws the precalculated path traced by the partial sum of the Fourier series.
 */
function drawPath() {
  beginShape();
  noFill();
  strokeWeight(2);
  stroke(PATH_COLOR);
  for (let i = 0; i < path.length; i += 1 + SKIP) {
    vertex(path[i].x, path[i].y);
  }
  endShape();
}

/**
 * Draws the trigonometric polynomial of the partial sum of the Fourier series.
 */
function drawPolynomial() {
  let ps = createVector(0, 0);
  let prevPs;

  let x = 0;
  let y = 0;

  for (let n = 0; n < N; n++) {
    let freq = fourier[n].freq;

    if (freq < usedFreq + 1 || freq > N - usedFreq - 1) {

      let freq = fourier[n].freq;
      let radius = fourier[n].amp;
      let phase = fourier[n].phase;

      x += radius * Math.cos(freq * t + phase);
      y += radius * Math.sin(freq * t + phase);

      prevPs = ps;
      ps = toScreenCoord(x, y);

      if (n != 0 && radius > descaleFactor * MIN_RADIUS) {
        // CIRCLE
        noFill();
        strokeWeight(1);
        stroke(120 - 50 * n / N);
        ellipse(prevPs.x, prevPs.y, radius * scaleFactor * 2);

        // LINE
        strokeWeight(2);
        line(prevPs.x, prevPs.y, ps.x, ps.y);
      }
    }
  }

  polPath.unshift(ps);

  noFill();
  strokeWeight(3);
  for (let i = 0; i < polPath.length - 1; i++) {
    let lineColor = lerpColor(polColor, color(PATH_COLOR), i / polPath.length);
    stroke(lineColor.levels[0], lineColor.levels[1], lineColor.levels[2]);
    line(polPath[i].x, polPath[i].y, polPath[i + 1].x, polPath[i + 1].y);
  }

  strokeWeight(8);
  stroke(polColor);
  // drawingContext.shadowBlur = 20;
  point(ps.x, ps.y);
  // drawingContext.shadowBlur = 0;

}

function draw() {

  background(0);

  let fps = frameRate();
  fill(255);
  stroke(0);
  text("FPS: " + fps.toFixed(2), 10, height - 10);

  /* *
  // MAIN AXIS
  noFill();
  stroke(50);
  strokeWeight(1);
  
  // x axis
  line(xOrigin - scaleFactor * 1.5, yOrigin, xOrigin + scaleFactor * 1.5, yOrigin);
  // y axis
  line(xOrigin, yOrigin - scaleFactor * 1.5, xOrigin, yOrigin + scaleFactor * 1.5);

  rect(xOrigin, yOrigin, scaleFactor, scaleFactor);
  /* */

  /* */
  // SPECTRUM
  strokeWeight(3);
  for (let n = 0; n < maxFreq; n++) {
    stroke(200);
    let spXOffset = (n + 0.5) * distance;
    line(x2Origin + spXOffset, y2Origin,
      x2Origin + spXOffset, y2Origin - secScaleFactor * fourier[N / 2 + n + 1].amp);
    line(x2Origin - spXOffset, y2Origin,
      x2Origin - spXOffset, y2Origin - secScaleFactor * fourier[N / 2 - n - 1].amp);

    fill(200);
    stroke(0);
    let spFontSize = scaleFactor / 8;
    textSize(spFontSize);
    text(n + 1, x2Origin + spXOffset, y2Origin + spFontSize);
    text(- n - 1, x2Origin - spXOffset, y2Origin + spFontSize);
  }
  /* */

  if (updateTimer > 0) {
    updateTimer--;
  } else if (updateTimer == 0) {
    calcPath();
    updateTimer--;
  }

  // PATH
  if (!remove) {
    drawPath();
  }

  // POLYNOMIAL
  drawPolynomial();

  // PROGRESS BAR, MOUSE ICON & UPDATE CIRCLE
  let barProgr = pos / MAX_POS;
  drawProgressBar(barProgr);
  drawMouseIcon(barProgr, t);

  /* IMAGE *
  beginShape();
  noFill();
  stroke(100);
  strokeWeight(1);
  for (let k = 0; k < sampledPoints.length; k++) {
    let testPoint = toScreenCoord(sampledPoints[k].re, sampledPoints[k].im);
    vertex(testPoint.x, testPoint.y)
  }
  endShape();
  /* */

  t += dt;

  if (t > TWO_PI + tInc) {
    t = tInc;
    // polPath = [];
    remove = true;
  }

  if (remove) {
    polPath.pop();
  }

}

