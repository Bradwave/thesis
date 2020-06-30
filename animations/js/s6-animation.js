// TIME
let t = 0;

// AXIS
let mxStart, mxFinish, myStart, myFinish;
let dxStart, dxFinish, dyStart, dyFinish;
let sxStart, sxFinish, syStart, syFinish;
let sx1, sx2;

// TEXT
let tSize;
let tFont;

// BEZIER & FOURIER
let bezier;
let sampledPoints;
let imagePath = [];
let xImagePath = [];
let yImagePath = [];

let fourier;
let N;
let dt;

const PATH_COLOR = 100;
let imageColors = [];
let blue, green, yellow, red;

const MIN_DISTANCE = 4;
const MIN_RADIUS = 3;
const SKIP = 1;

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
let xPath = [];
let yPath = [];
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

function convertBezier() {
  resetImagePath();
  storePoint(sampledPoints[0], 0);

  let prevPoint = sampledPoints[0];
  let sLength = sampledPoints.length;

  for (let k = 1; k < sLength; k++) {
    const sPoint = sampledPoints[k];
    if (pow(scaleFactor * (sPoint.re - prevPoint.re), 2)
      + pow(scaleFactor * (sPoint.im - prevPoint.im), 2) > MIN_DISTANCE * MIN_DISTANCE) {
      storePoint(sPoint, k / sLength);
      prevPoint = sPoint;
    }
  }
  storePoint(sampledPoints[0], 1);
}

function storePoint(sPoint, k) {
  let time = - PI + k * TWO_PI;
  imagePath.push(toScreenCoord(sPoint.re, sPoint.im));
  xImagePath.push(toSecondaryScreenCoord(time, sPoint.re, 0.5));
  yImagePath.push(toSecondaryScreenCoord(time, sPoint.im, -0.5));
  imageColors.push(mixColors(k));
}

// GRAPHICS FUNCTIONS

function preload() {
  loadIcons();
  tFont = loadFont("https://bradwave.github.io/thesis/dist/theme/fonts/latin-modern/lmroman10-bolditalic.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(24);
  blue = color(6, 141, 233);
  green = color(6, 233, 108);
  yellow = color(233, 199, 6);
  red = color(212, 45, 19);
  textFont(tFont);

  setOrigin(1, 2);

  bezier = new Polybezier(mole);
  sampledPoints = bezier.samplePoints(10);
  rescaleAndOffset(1.05, 0, 0.25);

  convertBezier();

  fourier = dft(sampledPoints);
  N = fourier.length;
  dt = TWO_PI / N;

  updateGraphics();
  setProgressGraphics(1, MIN_POS / MAX_POS);
}

function mixColors(k) {
  let resultColor;
  if (k > 0.75) {
    resultColor = lerpColor(blue, red, (1 - k) / 0.25);
  } else if (k > 0.5) {
    resultColor = lerpColor(red, yellow, (0.75 - k) / 0.25);
  } else if (k > 0.25) {
    resultColor = lerpColor(yellow, green, (0.5 - k) / 0.25);
  } else {
    resultColor = lerpColor(green, blue, (0.25 - k) / 0.25);
  }
  return resultColor;
}

function resetPaths() {
  path = [];
  xPath = [];
  yPath = [];
}

function resetImagePath() {
  imagePath = [];
  xImagePath = [];
  yImagePath = [];
  imageColors = [];
}

function windowResized() {
  resetPaths();
  updateTimer = UPDATE_MAX_TIME;
  resizeCanvas(windowWidth, windowHeight);

  updateOrigin();
  updateGraphics();
  convertBezier();
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

  usedFreq = Math.round(progr * 0.4 * N + 1);
  if (usedFreq > FIRST_HEAVY_FREQ) {
    updateTimer = Math.round(progr * UPDATE_MAX_TIME);
  } else {
    updateTimer = 0;
  }
}

/**
 * Update time and axis info.
 */
function updateGraphics() {
  tInc = t % 1;

  tSize = Math.round(scaleFactor / 5);

  mxStart = xOrigin - scaleFactor * 1.5;
  mxFinish = xOrigin + scaleFactor * 1.5;
  myStart = yOrigin - scaleFactor * 2;
  myFinish = yOrigin + scaleFactor * 2;
  dxStart = x2Origin - 3.5 * secScaleFactor + 0.5 * distance;
  dxFinish = x2Origin + 3.5 * secScaleFactor + 0.5 * distance;
  dyStart = y2Origin - secScaleFactor * 1.5;
  dyFinish = y2Origin + secScaleFactor * 1.5;
  sxStart = x2Origin - 3.5 * secScaleFactor - 0.5 * distance;
  sxFinish = x2Origin + 3.5 * secScaleFactor - 0.5 * distance;
  syStart = y2Origin - secScaleFactor * 1.5;
  syFinish = y2Origin + secScaleFactor * 1.5;
  sx1 = x2Origin + 0.5 * distance
  sx2 = x2Origin - 0.5 * distance;
}

// PATHS FUNCTIONS

/**
 * Calculate the path traced by the partial sum of the Fourier series.
 */
function calcPath() {
  resetPaths();

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

    ps = toSecondaryScreenCoord(time - PI, x, 0.5);
    xPath.unshift(ps);

    ps = toSecondaryScreenCoord(time - PI, y, -0.5);
    yPath.unshift(ps);
  }

}

/**
 * Draws the precalculated path traced by the partial sum of the Fourier series.
 */
function drawPath() {
  noFill();
  strokeWeight(2);
  stroke(PATH_COLOR);

  for (let k = 0; k < path.length - 1; k += 1 + SKIP) {
    line(path[k].x, path[k].y, path[k + 1 + SKIP].x, path[k + 1 + SKIP].y);
    line(xPath[k].x, xPath[k].y, xPath[k + 1 + SKIP].x, xPath[k + 1 + SKIP].y);
    line(yPath[k].x, yPath[k].y, yPath[k + 1 + SKIP].x, yPath[k + 1 + SKIP].y);
  }
}

/**
 * Draws the image and the projections.
 */
function drawImage() {
  noFill();
  strokeWeight(2);
  const maxPosition = (t - tInc) * imagePath.length;
  let k = 0;
  while (k < maxPosition - 1) {
    stroke(imageColors[k]);
    line(imagePath[k].x, imagePath[k].y, imagePath[k + 1].x, imagePath[k + 1].y);
    line(xImagePath[k].x, xImagePath[k].y, xImagePath[k + 1].x, xImagePath[k + 1].y);
    line(yImagePath[k].x, yImagePath[k].y, yImagePath[k + 1].x, yImagePath[k + 1].y);

    k++;
  }
  const iPoint = imagePath[k];
  const xPoint = xImagePath[k];
  const yPoint = yImagePath[k];
  strokeWeight(1);
  stroke(green, 150);
  line(iPoint.x, iPoint.y, iPoint.x, yOrigin);
  line(xPoint.x, xPoint.y, xPoint.x, y2Origin);
  stroke(red);
  line(iPoint.x, iPoint.y, xOrigin, iPoint.y);
  line(yPoint.x, yPoint.y, yPoint.x, y2Origin);
  strokeWeight(8);
  stroke(255);
  point(iPoint.x, iPoint.y);
  point(xPoint.x, xPoint.y);
  point(yPoint.x, yPoint.y);
}

function draw() {

  background(0);

  // MAIN AXIS
  noFill();
  stroke(80);
  strokeWeight(1);
  // x axis
  line(mxStart, yOrigin, mxFinish, yOrigin);
  // y axis
  line(xOrigin, myStart, xOrigin, myFinish);

  // SECONDARY AXIS
  // DX
  // x axis
  line(dxStart, y2Origin, dxFinish, y2Origin);
  // y axis
  line(sx1, dyStart, sx1, dyFinish);
  // SX
  // x axis
  line(sxStart, y2Origin, sxFinish, y2Origin);
  // y axis
  line(sx2, syStart, sx2, syFinish);

  // TEXT
  stroke(0);
  fill(255);
  textSize(tSize);
  text("u(t)", sx1 - tSize, dyFinish + tSize);
  text("v(t)", sx2 - tSize, dyFinish + tSize);
  text("f(t)=u(t)+iv(t)", xOrigin - tSize * 4, myFinish + tSize)
  
  // UPDATE TIMER & CALC PATH
  if (updateTimer > 0) {
    updateTimer--;
  } else if (updateTimer == 0) {
    calcPath();
    updateTimer--;
  }

  // PATH & IMAGE
  drawPath();
  drawImage();

  // PROGRESS BAR, MOUSE ICON & UPDATE CIRCLE
  let barProgr = pos / MAX_POS;
  drawProgressBar(barProgr);
  drawMouseIcon(barProgr, t);

  t += 0.001;

  if (t > 1 + tInc) {
    t = tInc;
  }

}

