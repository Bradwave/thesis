/**
 * PROGRESS BAR & MOUSE ICON
 */

// TIMERS
let barTimer = 0;
const BAR_MAX_TIME = 120;
let barGradTimer = 0;
const BAR_GRAD_MAX_TIME = 120;
let anTimer = 0;
const AN_MAX_TIME = 30;

// PROGRESS BAR DIMENSIONS & POSITION
let barHeight = 240;
const BAR_WIDTH = 8;
let progressHeight;
let barYOffset = 240;
let barXOffset = 55;

let minPos = 0;

let wScale = 1;

// MOUSE ICON DIMENSIONS & POSITION
let imgX;
let imgY;
let mwIconWidth;
let mwIconHeight;

// MOUSE ICON RESOURCES
let mwIcon;
let arrowUp;
let arrowDown;
let wheelGlow;
let arrowUpGlow;
let arrowDownGlow;

let imgsLink = 'https://bradwave.github.io/thesis/animations/icons/';

/**
 * Load icons.
 */
function loadIcons() {
    mwIcon = loadImage(imgsLink + 'mw-icon.png');
    arrowUp = loadImage(imgsLink + 'arrow-up.png');
    arrowDown = loadImage(imgsLink + 'arrow-down.png');
    wheelGlow = loadImage(imgsLink + 'wheel-glow.png');
    arrowUpGlow = loadImage(imgsLink + 'arrow-up-glow.png');
    arrowDownGlow = loadImage(imgsLink + 'arrow-down-glow.png');
}

/**
 * Set the position and size of the progress bar according to the window size.
 * Set the canvas scale and the minimum progress position.
 * @param {Number} s Scale of the window width and height.
 * @param {Number} minPos A number between 0 (included) and 1 (excluded): it represents the minimum progress position.
 */
function setProgressGraphics(s, mp) {
    wScale = s;
    minPos = mp;

    updateProgressGraphics();
}

/**
 * Update the position and size of the progress bar according to the window size.
 * The canvas scale and the minimum progress position remain unvaried.
 */
function updateProgressGraphics() {
    // progress bar
    barHeight = windowHeight / 3;
    barYOffset = 120 + windowHeight / 6;
    barXOffset = windowWidth / 40 + 25;

    // icons
    mwIconHeight = windowHeight / 6;
    mwIconWidth = mwIconHeight * mwIcon.width / mwIcon.height;
    imgX = windowWidth * wScale - barXOffset - mwIconWidth / 2 + BAR_WIDTH / 2;
    imgY = windowHeight * wScale - barYOffset + 5;
}

/**
 * Set the timers for fade animation.
 */
function setTimers() {
    if (barTimer < 1) {
        anTimer = AN_MAX_TIME;
    }
    barTimer = BAR_MAX_TIME;
    barGradTimer = BAR_GRAD_MAX_TIME;
}

function mouseWheel(event) {
    scrollIncrement(event.delta);
}

function touchStarted() {
    startPos = mouseY;
    return false;
}

function touchMoved() {
    finalPos = mouseY;
    scrollIncrement((finalPos - startPos) * 3);
    startPos = finalPos;
    return false;
}

/**
 * Scroll a set increment. Overload this method!
 * @param {Number} inc Increment of the scroll.
 */
function scrollIncrement(inc) {

}

/**
 * Draw the brogress bar alongside the right side of the screen.
 * @param {Number} pos A number between 0 and 1 (included): it represents the progress.
 */
function drawProgressBar(pos) {
    noStroke();

    alpha = 255;

    if (barTimer > 0) {
        barTimer--;
        if (anTimer > 0) {
            alpha = 255 - 255 * anTimer / AN_MAX_TIME;
            anTimer--;
        }
    } else {
        if (barGradTimer > 0) {
            barGradTimer--;
        }
        alpha = 255 * barGradTimer / BAR_MAX_TIME;
    }

    // background bar arc
    fill(100, alpha);
    arc(windowWidth * wScale - barXOffset + BAR_WIDTH / 2, windowHeight * wScale - barHeight - barYOffset + BAR_WIDTH / 2,
        BAR_WIDTH, BAR_WIDTH, PI, 0);
    arc(windowWidth * wScale - barXOffset + BAR_WIDTH / 2, windowHeight * wScale - barYOffset - BAR_WIDTH / 2,
        BAR_WIDTH, BAR_WIDTH, 0, PI);
    rect(windowWidth * wScale - barXOffset, windowHeight * wScale - barHeight - barYOffset + BAR_WIDTH / 2,
        BAR_WIDTH, barHeight - BAR_WIDTH);

    // progress bar arc
    fill(255, alpha);
    progressHeight = Math.abs(pos) * barHeight;
    arc(windowWidth * wScale - barXOffset + BAR_WIDTH / 2, windowHeight * wScale - progressHeight - barYOffset + 4,
        BAR_WIDTH, BAR_WIDTH, PI, 0);
    arc(windowWidth * wScale - barXOffset + BAR_WIDTH / 2, windowHeight * wScale - barYOffset - BAR_WIDTH / 2,
        BAR_WIDTH, BAR_WIDTH, 0, PI);
    rect(windowWidth * wScale - barXOffset, windowHeight * wScale - progressHeight - barYOffset + BAR_WIDTH / 2,
        BAR_WIDTH, progressHeight - BAR_WIDTH);
}

/**
 * Draw the mouse icon on the bottom right part of the screen.
 * @param {Number} pos A number between 0 and 1 (included): it represents the progress.
 * @param {Number} t A periodic value with period 2*PI: it represents the time.
 */
function drawMouseIcon(pos, t) {
    fill(0,0,0,0);

    let oscillation = 0.5 * (1 + sin(4 * t));

    // mouse icon + wheel
    tint(255, 255);
    image(mwIcon, imgX, imgY, mwIconWidth, mwIconHeight);

    // arrow up
    if (pos > minPos) {
        tint(255, 255);
        image(arrowDown, imgX, imgY + oscillation * 5, mwIconWidth, mwIconHeight);
        tint(255, oscillation * 255);
        image(arrowDownGlow, imgX, imgY + oscillation * 5, mwIconWidth, mwIconHeight);
    }

    // arrow down
    if (pos < 1) {
        tint(255, 255);
        image(arrowUp, imgX, imgY - oscillation * 5, mwIconWidth, mwIconHeight);
        tint(255, oscillation * 255);
        image(arrowUpGlow, imgX, imgY - oscillation * 5, mwIconWidth, mwIconHeight);
    }

    // wheel glow
    tint(255, oscillation * 255);
    image(wheelGlow, imgX, imgY, mwIconWidth, mwIconHeight);

    /* TEST RECTANGLE *
    stroke(200);
    strokeWeight(1);
    noFill();
    rect(windowWidth - barXOffset - mwIconWidth / 2 + BAR_WIDTH / 2, windowHeight - barYOffset + 5,
      mwIconWidth, mwIconHeight);
    /* */
}