

// Seaboard Block Super Powered Keyboard.mp3
var songName = "Biz - Petrunko (Scott Rill Remix) (320 kbps).mp3";
var smoothing = .5; // [0, .999] .999 super slow fall (used for amplitude drawing or drawBars)

var song;
var fft;

var bars = 256; // number of bars on the screen (power of 2) [32, 32768]

// falling wave form variables
var barFallingSpeed = 4; // used in conjunction with fallingBars and drawWaveform3 (Temporary variable inside function currently overrides this variable)
var minFallingSpeed = .1; // used to the fallingSpeed in the else statement doesn't ever just go to 0
var fallSpeedScaler = .04; // speed at which bars fall (0, 1) (higher = faster fallSpeed)
var fallSpeedScaler2 = .99; // speed at which speed changes (0, 1) (higher = slower fallSpeed change)

var fallingBars = []; // drawFallingWaveform
var fallingSpeeds = []; // drawFallingWaveform2
var barColors = [];

// Circular Variables
var barGapAngle; // must be initialized in setup because no PI constant
var centerX;
var centerY;
var radius = 200;
var arr = []; // will store barGapAngle, barX1, barY1
var waveHeight = 100; // multipler for barHeight
var minBarHeight =  radius + 2;

function preload() {
	song = loadSound(songName);
}

function setup() {
	barGapAngle = 2 * PI / bars;
	centerX = windowWidth / 2;
	centerY = windowHeight / 2;
	for (var i = 0; i < bars; i++) {
		arr[i] = [];
		arr[i][0] = i * barGapAngle;
		barAngle = arr[i][0];
		arr[i][1] = radius * cos(barAngle) + centerX; // barX1
		arr[i][2] = radius * sin(barAngle) + centerY; // barY1
	}
	initFallingBars(); // drawFallingWaveform
	initFallingSpeeds(); // drawFallingWaveform2
	initBarColors();
	
	song.loop();
	fft = new p5.FFT(smoothing, bars); 
	createCanvas(windowWidth, windowHeight); 
	
	strokeWeight(4); // size of lines
	
}

function draw() {
	background(0); 
	
	drawCircularWaveform2();
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

// draws waveform with falling bars with falling speeds that are initially proportional to the fallingBars
// but the fallingSpeeds also change over time
function drawFallingWaveform3() {
	barCurrentX = barX;
	fft.analyze();
	var waves = fft.waveform(bars);
	for (var i = 0; i < waves.length; i++) {
		var amp = max(waves[i], 0);
		var barHeight = max(minBarHeight, amp * waveHeight);
		fallingSpeeds[i] = max(minFallingSpeed, fallingSpeeds[i] * fallSpeedScaler2); // fallSpeed changes after each call to this function
		fallingBars[i] -= fallingSpeeds[i];
		if (barHeight > fallingBars[i]) {
			fallingBars[i] = barHeight;
			fallingSpeeds[i] = barHeight * fallSpeedScaler;
		}
		
		fill(barColors[i]);
		rect(barCurrentX, barY, barWidth, -fallingBars[i], rectangleRadius); // negative fallingBars so it goes up
		barCurrentX += barWidth + barGap; // get next barX
	}
}

function drawCircularWaveform() {
	fft.analyze();
	var waves = fft.waveform(bars);
	for (var i = 0; i < waves.length; i++) { // lines and strokeweight for bar stylization
		var barHeight = max(minBarHeight, radius + waves[i] * waveHeight);
		var barAngle = arr[i][0];
		var barX2 = barHeight * cos(barAngle) + centerX;
		var barY2 = barHeight * sin(barAngle) + centerY;
		stroke(barColors[i]);
		
		line(arr[i][1], arr[i][2], barX2, barY2);
	}
}

// falling bars in circular formation
function drawCircularWaveform2() {
	fft.analyze();
	var waves = fft.waveform(bars);
	for (var i = 0; i < waves.length; i++) { // lines and strokeweight for bar stylization
		var barHeight = max(minBarHeight, radius + waves[i] * waveHeight);
		
		fallingSpeeds[i] = max(minFallingSpeed, fallingSpeeds[i] * fallSpeedScaler2); // fallSpeed changes after each call to this function
		fallingBars[i] -= fallingSpeeds[i];
		if (barHeight > fallingBars[i]) {
			fallingBars[i] = barHeight;
			fallingSpeeds[i] = barHeight * fallSpeedScaler;
		}
		
		var barAngle = arr[i][0];
		var barX2 = fallingBars[i] * cos(barAngle) + centerX;
		var barY2 = fallingBars[i] * sin(barAngle) + centerY;
		stroke(barColors[i]);
		line(arr[i][1], arr[i][2], barX2, barY2);
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
		let c = color(i, bars, bars);
		barColors[i] = c;
	}
}



