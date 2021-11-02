

// Seaboard Block Super Powered Keyboard.mp3
var songName = "Seaboard Block Super Powered Keyboard.mp3";
var smoothing = .9; // [0, .999] .999 super slow fall (used for amplitude drawing or drawBars)

var img;
var song;
var fft;

var barX = 100; // top left X-coord of first bar
var barY = 400; // top left Y-coord of first bar
var currentBarX; 
var bars = 128; // number of bars on the screen (power of 2) [32, 32768]
var barWidthGapRatio = 2; // ratio of bar widths to bar gaps (ex: if 2 then barWidth is 2 times bigger than barGap). Also, (.1, 10) for good ranges
var barGap; // gap between bars
var barWidth; // width of the bars

// Rectangle styling
var maxBarHeight = 100; // not really used
var minBarHeight = 5; // used in ALL functions named draw
var rectangleRadius = 4; // rounds the rectangle, 0 for no rectangular rounding
var barColor = 255;

// falling wave form variables
var barFallingSpeed = 8; // used in conjunction with fallingBars and drawWaveform3 (Temporary variable inside function currently overrides this variable)
var waveHeight = 100;
var minFallingSpeed = .1; // used to the fallingSpeed in the else statement doesn't ever just go to 0
var fallSpeedScaler = .2; // speed at which bars fall (0, 1) (higher = faster fallSpeed)
var fallSpeedScaler2 = .9; // speed at which speed changes (0, 1) (higher = slower fallSpeed change)

var barColorR; // red
var barColorG; // green
var barColorB; // blue
var barColorA = 50; // alpha

var fallingBars = []; // drawFallingWaveform
var fallingSpeeds = []; // drawFallingWaveform2

var titleName = "Clubbed to Death - The Matrix" // used for displaying text on the screen
var titleSize = 30;
var distBetweenTitleAndBars = 5;
var titleX = barX;
var titleY = barY - distBetweenTitleAndBars;
var titleFont = "Georgia";

// matrix rain global variables
var streams = [];
var fadeInterval = 1.6;
var symbolSize = 32;

// FFT (Fast Fourier Transform) is an analysis algorithm that isolates individual audio frequencies within a waveform.
// FFT: https://p5js.org/reference/#/p5.FFT
// Sound library: https://p5js.org/reference/#/libraries/p5.sound
// Local Server: http://127.0.0.1:8887
// Blur Image: https://p5js.org/reference/#/p5/filter
// Text: https://p5js.org/reference/#/p5/text


function preload() {
	song = loadSound(songName);
}

function setup() {
	// working spaces used for calculating widths and gaps of bars for a nice mapping on all window widths
	// the ratio is what gives the programmar control over the gaps and widths
	var workingSpaceX = windowWidth - barX * 2
	var gapWorkingSpace = workingSpaceX / (barWidthGapRatio + 1);
	var barWorkingSpace = workingSpaceX - gapWorkingSpace;
	barWidth = barWorkingSpace / bars;
	barGap = gapWorkingSpace / (bars - 1); // number of gaps is bars - 1	
	
	song.loop();
	fft = new p5.FFT(smoothing, bars); 
	createCanvas(windowWidth, windowHeight); 
	initFallingBars(); // drawFallingWaveform
	initFallingSpeeds(); // drawFallingWaveform2
	noStroke();
	
	// matrix rain setup
	var x = 0;
	for (var i = 0; i <= width / symbolSize; i++) {
		var stream = new Stream();
		stream.generateSymbols(x, random(-2000, 0));
		streams.push(stream);
		x += symbolSize;
	}
}

function draw() {
	background(0, 150); // note setting the Alpha to the background low creates a cool visual effect which can be done by: background(0, 30) where 
	// the second input argument is a number [0, 255] where 255 is opaque and 0 is transparent
	
	
	// matrix rain draw (also background has 150 Alpha)
	textFont('Consolas');
	textSize(symbolSize);
	streams.forEach(function(stream) {
		stream.render();
	});
	
	fill(0, 50); 
	rect(0, 0, windowWidth, windowHeight); // overlay over rain
	
	fill(0, 200);
	rect(0, titleY - titleSize - 20, windowWidth, windowHeight);
	
	textSize(titleSize);
	textFont(titleFont);
	fill(barColor);
	text(titleName, titleX, titleY);
	
	fill(barColor);
	drawFallingWaveform3();
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

function drawLinearAverages() {
	barCurrentX = barX;
	fft.analyze();
	var averages = fft.linAverages(bars);
	var maxAverageHeight = .5
	for (var i = 0; i < averages.length; i++) {
		var amp = averages[i];
		var barHeight = max(minBarHeight, amp * maxAverageHeight);
		rect(barCurrentX, barY, barWidth, barHeight, rectangleRadius);
		barCurrentX += barWidth + barGap; // get next barX
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
		rect(barCurrentX, barY, barWidth, fallingBars[i], rectangleRadius);
		barCurrentX += barWidth + barGap; // get next barX
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

function drawBars() {
	barCurrentX = barX;
	var maxBarHeight = 30;
	var spectrum = fft.analyze();
	for (var i = 0; i < spectrum.length; i++) {
		var amp =  spectrum[i] / 255;
		rect(barCurrentX, barY, barWidth, maxBarHeight * amp, rectangleRadius);
		barCurrentX += barWidth + barGap;
	}	
}

function SYMBOL(x, y, speed, first, opacity) {
	this.x = x;
	this.y = y;
	this.value;

	this.speed = speed;
	this.first = first;
	this.opacity = opacity;

	this.switchInterval = round(random(2, 25));

	this.setToRandomSymbol = function() {
		var charType = round(random(0, 5));
		if (frameCount % this.switchInterval == 0) {
			if (charType > 1) {
				// set it to Katakana
				this.value = String.fromCharCode(
					0x30A0 + floor(random(0, 97))
				);
			} else {
				// set it to numeric
				this.value = floor(random(0,10));
			}
		}
	}

	this.rain = function() {
		this.y = (this.y >= height) ? 0 : this.y += this.speed;
	}

}

function Stream() {
	this.symbols = [];
	this.totalSymbols = round(random(5, 35));
	this.speed = random(4, 22);

	this.generateSymbols = function(x, y) {
		var opacity = 255;
		var first = round(random(0, 4)) == 1;
		for (var i =0; i <= this.totalSymbols; i++) {
			symbol = new SYMBOL(
				x,
				y,
				this.speed,
				first,
				opacity
			);
			symbol.setToRandomSymbol();
			this.symbols.push(symbol);
			opacity -= (255 / this.totalSymbols) / fadeInterval;
			y -= symbolSize;
			first = false;
		}
	}

	this.render = function() {
		this.symbols.forEach(function(symbol) {
			if (symbol.first) {
				fill(140, 255, 170, symbol.opacity);
			} else {
				fill(0, 255, 70, symbol.opacity);
			}
			text(symbol.value, symbol.x, symbol.y);
			symbol.rain();
			symbol.setToRandomSymbol();
		});
	}
}







