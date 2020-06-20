let t = 0;
let path = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  path = [];
  resizeCanvas(windowWidth, windowHeight); 
} 

function draw() {
  background(0);

  let ww = width;
  let wh = height;
  let cx = ww * 0.5;
  let cy = wh * 0.5;

  noFill();
  stroke(30);
  strokeWeight(6);
  point(cx, cy);

  strokeWeight(2);
  let radius = Math.max(ww, wh) * 0.15 * 0.5;
  ellipse(cx, cy, radius * 2, radius * 2)

  v0 = createVector(cx, cy);

  let x1 = cx + radius * cos(t);
  let y1 = cy + radius * sin(t);
  v1 = createVector(x1, y1);

  line(v0.x, v0.y, v1.x, v1.y);
  ellipse(x1, y1, radius * 0.6 * 2, radius * 0.6 * 2)

  let x2 = x1 + radius * 0.6 * cos(2 * t + HALF_PI);
  let y2 = y1 + radius * 0.6 * sin(2 * t + HALF_PI);

  v2 = createVector(x2, y2);
  line(v1.x, v1.y, v2.x, v2.y);
  ellipse(x2, y2, radius * 0.3 * 2, radius * 0.3 * 2);

  let x3 = x2 + radius * 0.3 * cos(3 * t);
  let y3 = y2 + radius * 0.3 * sin(3 * t);

  v3 = createVector(x3, y3);
  line(v2.x, v2.y, v3.x, v3.y);

  strokeWeight(6);
  stroke(60);
  point(v3.x, v3.y);

  path.unshift(v3);

  beginShape();
  noFill();
  strokeWeight(2);
  for (let i = 0; i < path.length; i ++) {
    vertex(path[i].x, path[i].y);
  }
  endShape();
  
  t += 0.01;

  if(t > TWO_PI){
    t = 0;
    path = [];
  }
}