let t = 0;
let tInc = 0;
let path = [];
let remove = false;
let pol;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pol = [ [0.5, 0, 1], [0.4, PI, 2], [0.3, HALF_PI, 3] ];
}

function windowResized() {
  path = [];
  tInc = t % TWO_PI;
  remove = false;
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  let ww = width;
  let wh = height;

  let scale = Math.max(ww, wh) * 0.15 * 0.5;

  let cx = ww * 0.5;
  let cy = wh * 0.5 + scale / 2;

  noFill();
  stroke(30);
  strokeWeight(6);
  point(cx, cy);

  let prevX = cx;
  let prevY = cy;

  for (let n = 0; n < pol.length; n++) {  
    let r = pol[n][0];
    let phi = pol[n][1]
    let f = pol[n][2];

    let x = prevX + scale * r * cos(t * f + phi);
    let y = prevY + scale * r * sin(t * f + phi);

    strokeWeight(2);
    ellipse(prevX, prevY, scale * r * 2, scale * r * 2);
    line(prevX, prevY, x, y);

    prevX = x;
    prevY = y;
  }

  let p = createVector(prevX, prevY);

  path.unshift(p);

  beginShape();
  noFill();
  strokeWeight(3);
  for (let i = 0; i < path.length - 1; i++) {
    let lineColor = lerpColor(color(212, 45, 19), color(100), i / path.length);
    if (i < 6) {
      lineColor = lerpColor(lineColor, color(0), 1 - 0.8 * i / 5);
    }
    stroke(lineColor.levels[0], lineColor.levels[1], lineColor.levels[2],
      255 * (-Math.pow(i / path.length, 2) + 1));
    line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
  }
  endShape();

  strokeWeight(7);
  stroke(212, 45, 19);
  point(p.x, p.y);

  t += 0.01;

  if (t > TWO_PI + tInc) {
    t = tInc;
    remove = true;
  }

  if (remove) {
    path.pop();
  }
}