

var songName = "isoulation.mp3";
var smoothing = .5; // [0, .999] .999 super slow fall (used for amplitude drawing or drawBars)
var song;
var fft;

var centerX;
var centerY;
var barColors = [];
var barHeight;

var radius = 200;
var bars = 128;
var radialGap = 0.02;
var minBarHeight = .0001;
var waveHeight = 150; // multipler for barHeight
var colorStart = 0;

var fallingBars = []; // drawFallingWaveform
var fallingSpeeds = []; // drawFallingWaveform2
var barColors = [];
var barArray = [];

// falling wave form variables
var barFallingSpeed = 8; // used in conjunction with fallingBars and drawWaveform3 (Temporary variable inside function currently overrides this variable)
var minFallingSpeed = .1; // used to the fallingSpeed in the else statement doesn't ever just go to 0
var fallSpeedScaler = .4; // speed at which bars fall (0, 1) (higher = faster fallSpeed)
var fallSpeedScaler2 = .99; // speed at which speed changes (0, 1) (higher = slower fallSpeed change)

function preload() {
	song = loadSound(songName);
}

// CTRL + SHIFT + K to uncomment
// CTRL + SHIFT + Q to comment
function setup() {	
	centerX = windowWidth / 2;
	centerY = windowHeight / 2;
	barGapAngle = (2 * PI) / bars;
	for (var i = 0; i < bars; i++) {
		barArray[i] = [];
		barAngle = i * barGapAngle; // middle angle
		var angle1 = barAngle - radialGap;
		barArray[i][0] = angle1;
		barArray[i][1] = radius * cos(angle1) + centerX;
		barArray[i][2] = radius * sin(angle1) + centerY;
		var angle2 = barAngle + radialGap;
		barArray[i][3] = angle2;
		barArray[i][4] = radius * cos(angle2) + centerX;
		barArray[i][5] = radius * sin(angle2) + centerY;
	}
	initFallingBars(); // drawFallingWaveform
	initFallingSpeeds(); // drawFallingWaveform2
	initBarColors();
	strokeWeight(1);
	song.loop();
	fft = new p5.FFT(smoothing, bars); 
	createCanvas(windowWidth, windowHeight);
}

function draw() {
	background(0);
	drawFallingSquareCircleWaveforms();
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

function drawFallingSquareCircleWaveforms() {
	fft.analyze();
	var waves = fft.waveform(bars);
	colorStart++;
	initBarColors();
	for (var i = 0; i < bars; i++) {
		stroke(barColors[i]);
		fill(barColors[i]);
		barHeight = max(minBarHeight, waves[i] * waveHeight);
		
		fallingSpeeds[i] = max(minFallingSpeed, fallingSpeeds[i] * fallSpeedScaler2); // fallSpeed changes after each call to this function
		fallingBars[i] -= fallingSpeeds[i];
		if (barHeight > fallingBars[i]) {
			fallingBars[i] = barHeight;
			fallingSpeeds[i] = barHeight * fallSpeedScaler;
		}
		barHeight = fallingBars[i];
		
		var bX1 = barArray[i][1];
		var bY1 = barArray[i][2];
		var bX2 = barArray[i][4];
		var bY2 = barArray[i][5];
		var bX3 = barHeight * cos(barArray[i][3]) + bX2;
		var bY3 = barHeight * sin(barArray[i][3]) + bY2;
		triangle(bX1, bY1, bX2, bY2, bX3, bY3);
		triangle(
			bX1,
			bY1,
			bX3,
			bY3,
			barHeight * cos(barArray[i][0]) + bX1,
			barHeight * sin(barArray[i][0]) + bY1
		);
	}
}

// no rainbow colors
function drawFallingSquareCircleWaveforms2() {
	fft.analyze();
	var waves = fft.waveform(bars);
	for (var i = 0; i < bars; i++) {
		barHeight = max(minBarHeight, waves[i] * waveHeight);
		
		fallingSpeeds[i] = max(minFallingSpeed, fallingSpeeds[i] * fallSpeedScaler2); // fallSpeed changes after each call to this function
		fallingBars[i] -= fallingSpeeds[i];
		if (barHeight > fallingBars[i]) {
			fallingBars[i] = barHeight;
			fallingSpeeds[i] = barHeight * fallSpeedScaler;
		}
		barHeight = fallingBars[i];
		
		var bX1 = barArray[i][1];
		var bY1 = barArray[i][2];
		var bX2 = barArray[i][4];
		var bY2 = barArray[i][5];
		var bX3 = barHeight * cos(barArray[i][3]) + bX2;
		var bY3 = barHeight * sin(barArray[i][3]) + bY2;
		triangle(bX1, bY1, bX2, bY2, bX3, bY3);
		triangle(
			bX1,
			bY1,
			bX3,
			bY3,
			barHeight * cos(barArray[i][0]) + bX1,
			barHeight * sin(barArray[i][0]) + bY1
		);
	}
}

function drawSquareCircleWaveforms() {
	fft.analyze();
	var waves = fft.waveform(bars);
	for (var i = 0; i < bars; i++) {
		stroke(barColors[i]);
		fill(barColors[i]);
		barHeight = max(minBarHeight, waves[i] * waveHeight);
		var bX1 = barArray[i][1];
		var bY1 = barArray[i][2];
		var bX2 = barArray[i][4];
		var bY2 = barArray[i][5];
		var bX3 = barHeight * cos(barArray[i][3]) + bX2;
		var bY3 = barHeight * sin(barArray[i][3]) + bY2;
		triangle(bX1, bY1, bX2, bY2, bX3, bY3);
		triangle(
			bX1,
			bY1,
			bX3,
			bY3,
			barHeight * cos(barArray[i][0]) + bX1,
			barHeight * sin(barArray[i][0]) + bY1
		);
	}
}

// no rainbow color
function drawSquareCircleWaveforms2() {
	fft.analyze();
	var waves = fft.waveform(bars);
	for (var i = 0; i < bars; i++) {
		barHeight = max(minBarHeight, waves[i] * waveHeight);
		var bX1 = barArray[i][1];
		var bY1 = barArray[i][2];
		var bX2 = barArray[i][4];
		var bY2 = barArray[i][5];
		var bX3 = barHeight * cos(barArray[i][3]) + bX2;
		var bY3 = barHeight * sin(barArray[i][3]) + bY2;
		triangle(bX1, bY1, bX2, bY2, bX3, bY3);
		triangle(
			bX1,
			bY1,
			bX3,
			bY3,
			barHeight * cos(barArray[i][0]) + bX1,
			barHeight * sin(barArray[i][0]) + bY1
		);
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
	colorMode(HSB, bars);
	for (var i = 0; i < bars; i++) {
		let c = color((i + colorStart) % bars, bars, bars);
		barColors[i] = c;
	}
}



