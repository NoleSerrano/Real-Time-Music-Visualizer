

var songName = "danne.mp3";
var smoothing = .5; // [0, .999] .999 super slow fall (used for amplitude drawing or drawBars)
var song;
var fft;

var centerX;
var centerY;
var verts = 3; // initial vertices
var radius = 100;
var bars = 256;
var vertArray = [];
var totalBars;
var barsPerSide;
var vertGapAngle;
var barColors = [];
var barHeight;

var minBarHeight = .0001;
var waveHeight = 20; // multipler for barHeight
var minimumVerts = 2; // can go as low as 1
var colorStart = 0;
var rotateAngle = 0;
var rotateSpeed = .05;

// falling wave form variables
var barFallingSpeed = 16; // used in conjunction with fallingBars and drawWaveform3 (Temporary variable inside function currently overrides this variable)
var minFallingSpeed = 4; // used to the fallingSpeed in the else statement doesn't ever just go to 0
var fallSpeedScaler = .3; // speed at which bars fall (0, 1) (higher = faster fallSpeed)
var fallSpeedScaler2 = .99; // speed at which speed changes (0, 1) (higher = slower fallSpeed change)

var fallingBars = []; // drawFallingWaveform
var fallingSpeeds = []; // drawFallingWaveform2
var barColors = [];

function preload() {
	song = loadSound(songName);
}

// CTRL + SHIFT + K to uncomment
// CTRL + SHIFT + Q to comment
function setup() {	
	centerX = windowWidth / 2;
	centerY = windowHeight / 2;
	updateShape();
	
	// noCursor(); // hide mouse
	
	initFallingBars(); // drawFallingWaveform
	initFallingSpeeds(); // drawFallingWaveform2
	
	song.loop();
	fft = new p5.FFT(smoothing, bars); 
	createCanvas(windowWidth, windowHeight); 
	
	strokeWeight(3); // size of lines 
}

function draw() {
	background(0);
	drawShape();
	if (keyIsDown(90)) { // z (decrease vertices)
		verts = max(verts - 1, 2);
	}
	if (keyIsDown(67)) { // c (increase vertices)
		verts = min(verts + 1, bars);
	}
	if (keyIsDown(49)) { // 1 (clock-wise color)
		colorStart--;
		if (colorStart < 0) {
			colorStart = totalBars - 1;
		}
	}
	if (keyIsDown(51)) { // 3 (counter-clockwise color)
		colorStart++;
		if (colorStart >= totalBars) {
			colorStart = 0;
		}
	}
	if (keyIsDown(81)) { // q (rotate left)
		rotateAngle -= rotateSpeed;
		if (rotateAngle < 0) {
			rotateAngle = 2 * PI;
		}
	}
	if (keyIsDown(69)) { // e (rotate right)
		rotateAngle += rotateSpeed;
		if (rotateAngle > 2 * PI) {
			rotateAngle = 0;
		}
	}
}

// press the mouse to start the song
function mousePressed() {
	if (song.isPlaying()) {
		// .isPlaying() returns a boolean
		song.stop();
		background(255, 0, 0);
	} else {
		song.play();
		background(0, 255, 0);
	}
}

function drawShape() {
	fft.analyze();
	var waves = fft.waveform(bars);
	radius = dist(centerX, centerY, mouseX, mouseY);
	strokeWeight(1 * radius / 70); // line sizes proportional to radius
	barAngle = atan((mouseY - centerY) / (mouseX - centerX)); // mouse angle
	if (mouseX < windowWidth / minimumVerts) {
		barAngle += PI;
	}
	barAngle += rotateAngle;
	barsPerSide = floor(bars / verts);
	totalBars = verts * barsPerSide;
	initBarColors();
	vertGapAngle = (2 * PI) / verts;
	// get vert positions
	for (var i = 0; i < verts; i++) {
		vertArray[i] = [];
		vertArray[i][0] = i * vertGapAngle + barAngle;
		vertAngle = vertArray[i][0];
		vertArray[i][1] = radius * cos(vertAngle) + centerX; // barX1
		vertArray[i][2] = radius * sin(vertAngle) + centerY; // barY1
		vertArray[i][3] = vertAngle + vertGapAngle / 2; // bar angle
	}
	
	// positions on polygon
	var xb;
	var yb;
	var barX1;
	var barY1;
	var barX2;
	var barY2;
	var k = 0; // counter for barArray
	for (i = 0; i < verts - 1; i++) {
		barAngle = vertArray[i][3];
		xb = (vertArray[i + 1][1] - vertArray[i][1]) / (barsPerSide + 1); // how much to run
		yb = (vertArray[i + 1][2] - vertArray[i][2]) / (barsPerSide + 1); // how much to rise
		barX1 = vertArray[i][1];
		barY1 = vertArray[i][2];
		for (var j = 0; j < barsPerSide; j++) {
			barHeight = max(minBarHeight, waves[k]); // barHeight is proportional to radius
			barHeight *= radius;
			barX1 = barX1 + xb;
			barY1 = barY1 + yb;
			barX2 = barHeight * cos(barAngle) + barX1;
			barY2 = barHeight * sin(barAngle) + barY1;
			stroke(barColors[k]);
			line(barX1, barY1, barX2, barY2);
			k++;
		}
	}
	// last position
	barAngle = vertArray[i][3];
	xb = (vertArray[0][1] - vertArray[i][1]) / (barsPerSide + 1);
	yb = (vertArray[0][2] - vertArray[i][2]) / (barsPerSide + 1);
	barX1 = vertArray[i][1];
	barY1 = vertArray[i][2];
	for (var j = 0; j < barsPerSide; j++) {
		barHeight = max(minBarHeight, waves[k]); // barHeight is proportional to radius
		barHeight *= radius;
		barX1 = barX1 + xb;
		barY1 = barY1 + yb;
		barX2 = barHeight * cos(barAngle) + barX1;
		barY2 = barHeight * sin(barAngle) + barY1;
		stroke(barColors[k]);
		line(barX1, barY1, barX2, barY2);
		k++;
  }
}

function updateShape() {
  barsPerSide = floor(bars / verts);
  totalBars = verts * barsPerSide;
  initBarColors();
  vertGapAngle = (2 * PI) / verts;
}

function mouseWheel(event) {
  if (event.delta > 0) {
    verts = min(verts + 1, bars);
  } else {
    verts = max(verts - 1, minimumVerts);
  }
}

// increment vertices by 1 using 'a' or 'd'
function keyTyped() {
	if (key === 'a') {
		verts = max(verts - 1, minimumVerts);
	}
	if (key === 'd') {
		verts = min(verts + 1, bars);
	}
}

// called in setup before functions that use fallingBars
function initFallingBars() {
	for (var i = 0; i < bars; i++) {
		fallingBars[i] = minBarHeight;
	}
}

// called in setup before functions that use fallingSpeeds
function initFallingSpeeds() {
	for (var i = 0; i < bars; i++) {
		fallingSpeeds[i] = 0;	
	}
}

// rainbow bars
function initBarColors() {
	colorMode(HSB, totalBars);
	for (var i = 0; i < totalBars; i++) {
		let c = color((i + colorStart) % totalBars, totalBars, totalBars);
		barColors[i] = c;
	}
}



