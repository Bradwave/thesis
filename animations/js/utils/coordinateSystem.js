

// MINIMUM CANVAS DIMENSION
let minDim;

// COORDINATE SYSTEM
let coordSystem = 1;

// MAIN ORIGIN
let xOrigin;
let yOrigin;

let scaleFactor = 200.000000;
let descaleFactor = 1.000000 / scaleFactor;

// SECONDARY ORIGIN
let x2Origin;
let y2Origin;

let suvdivNumber = 1;
let distance = 100;
let secScaleFactor = 40;
let secDescaleFactor = 1.000000 / secScaleFactor;

// FORMULA ORIGIN
let xfOrigin;
let yfOrigin;

/**
 * Set the origin of the cartesian coordinate system according to the canvas size.
 * Set the coordinate system for the canvas and the number of subdivision of the secondary coordinate system.
 * @param {Number} coordSystem Coordinate system for the canvas: 0 for cartesian, 1 for screen system.
 * @param {Number} subdivNumber Number of subdivision of the secondary coordinate system.
 */
function setOrigin(s, sdn = 1) {
    coordSystem = s;
    subdivNumber = sdn;

    updateOrigin();
}

/**
 * Set the origin of the cartesian coordinate system according to the canvas size.
 * The canvas coordinate system and the number of subdivision of the secondary coordiante system remain unvaried.
 */
function updateOrigin() {
    minDim = min(width, height);

    // main origin
    xOrigin = coordSystem * width * 0.5;
    yOrigin = coordSystem * height * 0.5 + minDim * 0.14;

    scaleFactor = minDim / 7;
    descaleFactor = 1.000000 / scaleFactor;

    // secondary origin
    x2Origin = coordSystem * width * 0.5;
    y2Origin = coordSystem * height * 0.16 + (1 - coordSystem) * (- height * 0.34);

    distance = width / (subdivNumber);
    secScaleFactor = minDim / 15;
    secDescaleFactor = 1.000000 / secScaleFactor;

    // formula origin
    xfOrigin = width * 0.5;
    yfOrigin = height * 0.16;
}

/**
 * Converts screen coordinates to cartesian coordinats with origin in the center of the window.
 * @param {Number} x Coordinate x
 * @param {Number} y Coordinate y
 */
function toCartesian(x, y) {
    let cx = (x - xOrigin) * descaleFactor;
    let cy = (yOrigin - y) * descaleFactor;
    return createVector(cx, cy);
}

/**
 * Converts cartesian coordiantes to screen coordinats with origin in the top left corner of the window.
 * @param {Number} x Coordinate x
 * @param {Number} y Coordinate y
 */
function toScreenCoord(x, y) {
    let sx = x * scaleFactor + xOrigin;
    let sy = yOrigin - y * scaleFactor;
    return createVector(sx, sy);
}

/**
 * Converts cartesian coordinats to secondary screen coordinats for the upper part of the canvas.
 * @param {Number} x Coordinate x
 * @param {Number} y Coordinate y
 * @param {Number} pos Position on the x axis
 */
function toSecondaryScreenCoord(x, y, pos) {
    let sx = x * secScaleFactor + x2Origin + pos * distance;
    let sy = y2Origin - y * secScaleFactor;
    return createVector(sx, sy);
}