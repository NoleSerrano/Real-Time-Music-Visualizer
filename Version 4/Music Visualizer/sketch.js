

var songName = "Squid_Game_Do_It_To_It_Zedd_Edit.mp3";
var smoothing = .5; // [0, .999] .999 super slow fall (used for amplitude drawing or drawBars)

var song;
var fft;

var bars = 256; // number of bars for waveform calculation (power of 2) [32, 32768] (different because polygons may not be a power of 2)
var centerX;
var centerY;
var radius = 256;
var verts = 4;
var vertGapAngle;
var vertArray = [];
var totalBars; // actual number of bars on screen rather than number to calculate waveforms
// need to adjust barColors to totalBars
var barsPerSide;
var barArray = [];

var minBarHeight = 2;
var waveHeight = 128; // multipler for barHeight

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

function setup() {
	
	barsPerSide = floor(bars / verts);
	totalBars = verts * barsPerSide;
	vertGapAngle = (2 * PI) / verts;
	centerX = windowWidth / 2;
	centerY = windowHeight / 2;
	// get positions of the vertices
	for (var i = 0; i < verts; i++) {
		vertArray[i] = [];
		vertArray[i][0] = i * vertGapAngle;
		vertAngle = vertArray[i][0];
		vertArray[i][1] = radius * cos(vertAngle) + centerX; // barX1
		vertArray[i][2] = radius * sin(vertAngle) + centerY; // barY1
		vertArray[i][3] = vertAngle + vertGapAngle / 2; // bar angle
	}
	
	// get positions of bars on the polygon
	var xb;
	var yb;
	var barX1;
	var barY1;
	var k = 0; // counter for barArray
	for (i = 0; i < verts - 1; i++) {
		xb = (vertArray[i + 1][1] - vertArray[i][1]) / (barsPerSide + 1); // how much to run
		yb = (vertArray[i + 1][2] - vertArray[i][2]) / (barsPerSide + 1); // how much to rise
		barX1 = vertArray[i][1];
		barY1 = vertArray[i][2];
		for (var j = 0; j < barsPerSide; j++) {
			barX1 = barX1 + xb;
			barY1 = barY1 + yb;
			// put into array
			barArray[k] = [];
			barArray[k][0] = barX1;
			barArray[k][1] = barY1;
			k++;
		}
	}
	xb = (vertArray[0][1] - vertArray[i][1]) / (barsPerSide + 1);
	yb = (vertArray[0][2] - vertArray[i][2]) / (barsPerSide + 1);
	barX1 = vertArray[i][1];
	barY1 = vertArray[i][2];
	for (var j = 0; j < barsPerSide; j++) {
		barX1 = barX1 + xb;
		barY1 = barY1 + yb;
		// put into array
		barArray[k] = [];
		barArray[k][0] = barX1;
		barArray[k][1] = barY1;
		k++;
	}	
	
	initFallingBars(); // drawFallingWaveform
	initFallingSpeeds(); // drawFallingWaveform2
	initBarColors();
	
	song.loop();
	fft = new p5.FFT(smoothing, bars); 
	createCanvas(windowWidth, windowHeight); 
	
	strokeWeight(3); // size of lines
	
}

function draw() {
	background(0); 
	drawPolygonalWaveform2();
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

function drawPolygonalWaveform() {
	fft.analyze();
	var waves = fft.waveform(bars);
	var k = 0; // counter for barArray, waves, and barColors
	// note: some waves will be missing if polygon isn't a power of 2
	for (var i = 0; i < verts; i++) {
		var barAngle = vertArray[i][3];
		for (var j = 0; j < barsPerSide; j++) {
			var barHeight = max(minBarHeight, waves[k] * waveHeight);
			var barX1 = barArray[k][0];
			var barY1 = barArray[k][1];
			var barX2 = barHeight * cos(barAngle) + barX1;
			var barY2 = barHeight * sin(barAngle) + barY1;
			stroke(barColors[k]);
			line(barX1, barY1, barX2, barY2);
			k++;
		}
	}
}

// falling polygonal waveforms
function drawPolygonalWaveform2() {
	fft.analyze();
	var waves = fft.waveform(bars);
	var k = 0;
	for (var i = 0; i < verts; i++) {
		var barAngle = vertArray[i][3];
		for (var j = 0; j < barsPerSide; j++) {
			var barHeight = max(minBarHeight, waves[k] * waveHeight);
			fallingSpeeds[k] = max(minFallingSpeed, fallingSpeeds[k] * fallSpeedScaler2); // fallSpeed changes after each call to this function
			fallingBars[k] -= fallingSpeeds[k];
			if (barHeight > fallingBars[k]) {
				fallingBars[k] = barHeight;
				fallingSpeeds[k] = barHeight * fallSpeedScaler;
			}
			var barX1 = barArray[k][0];
			var barY1 = barArray[k][1];
			var barX2 = fallingBars[k] * cos(barAngle) + barX1;
			var barY2 = fallingBars[k] * sin(barAngle) + barY1;
			stroke(barColors[k]);
			line(barX1, barY1, barX2, barY2);
			k++;
		}
	}
}

// called in setup before functions that use fallingBars
function initFallingBars() {
	for (var i = 0; i < totalBars; i++) {
		fallingBars[i] = minBarHeight;
	}
}

// called in setup before functions that use fallingSpeeds
function initFallingSpeeds() {
	for (var i = 0; i < totalBars; i++) {
		fallingSpeeds[i] = 0;	
	}
}

// rainbow bars
function initBarColors() {
	colorMode(HSB, totalBars);
	for (var i = 0; i < totalBars; i++) {
		let c = color(i, totalBars, totalBars);
		barColors[i] = c;
	}
}



