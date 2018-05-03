// video capture object
var capture;

// color we want to track
var r = 0;
var g = 0;
var b = 0;

var speed = 8;
var score = 0;
// what is our current threshold?  This is how sensitve our color detection algorithm should be
// low numbers means more sensitivity, high numbers mean less sensitivity (aka false positives)
var threshold = 20;

// artwork
var rocket, brick,fuel,missSound,scoreSound;

// fish location
var rocketLocX = 0;
var rocketLocY = 0;

var bricks = [];
var fuels = [];

function preload() {
  rocket = loadImage('rocket.png');
  brick = loadImage('brick.jpg');
  fuel = loadImage('fuel.png');
  missSound = loadSound('fall.mp3');
  scoreSound = loadSound('coins.mp3');
}

function setup() {
  createCanvas(1000, 600);

  // start up our web cam
  capture = createCapture({
    video: {
      mandatory: {
        minWidth: 1000,
        minHeight: 600,
        maxWidth: 1000,
        maxHeight: 600
      }
    }
  });
  capture.hide();

  for (var i = 0; i < 8; i++) {
    bricks.push( new Brick() );
  }

  for (var i = 0; i < 5; i++){
    fuels.push( new Fuel() )
  }
}

function draw() {
  // expose the pixels in the incoming video stream
  capture.loadPixels();

  // if we have some pixels to work wtih them we should proceed
  if (capture.pixels.length > 0) {

    // set up variables to test for the best pixel
    var bestLocations = [];

    for (var i = 0; i < capture.pixels.length; i += 4) {
      // determine how close of a match this color is to our desired color
      var match = dist(r, g, b, capture.pixels[i], capture.pixels[i + 1], capture.pixels[i + 2]);
      if (match < threshold) {
        // this pixel qualifies!  store its location into our array
        bestLocations.push(i);
      }
    }

    // draw the video
    imageMode(CORNER);
    image(capture, 0, 0);

    // do we have a best match?  it's possible that no pixels met our threshold
    if (bestLocations.length > 0) {
      // average up all of our locations
      var xSum = 0;
      var ySum = 0;
      for (var i = 0; i < bestLocations.length; i++) {
        xSum += (bestLocations[i] / 4) % 1000;
        ySum += (bestLocations[i] / 4) / 1000;
      }

      // average our sums to get our 'centroid' point
      rocketLocX = xSum / bestLocations.length;
      rocketLocY = 400;
    }
  }

  for (var i = 0; i < bricks.length; i++) {
    bricks[i].drawAndMove();
  }

  for (var i = 0; i < fuels.length; i++){
    fuels[i].drawAndMove();
  }

  imageMode(CENTER);
  image(rocket, rocketLocX, rocketLocY,200,200);
  textSize(20);
  text("Scores: "+score,30,30);
}

function mousePressed() {
  // memorize the color the user is clicking on
  var loc = int((mouseX  + mouseY  * capture.width) * 4);
  r = capture.pixels[loc];
  g = capture.pixels[loc + 1];
  b = capture.pixels[loc + 2];

  console.log("Looking for: R=" + r + "; G=" + g + "; B=" + b);
}

function keyPressed() {
  if (key == 'A') {
    threshold--;
    console.log("Threshold is now: " + threshold);
  }
  if (key == 'D') {
    threshold++;
    console.log("Threshold is now: " + threshold);
  }
}


function Brick() {
  // pick a random spot to fall from
  this.x = random(width);
  this.y = random(-300, 0);

  // perlin noise offest
  this.noiseOffset = random(1000);

  // draw and move
  this.drawAndMove = function() {
    this.y += speed;
    this.x += map(noise(this.noiseOffset), 0, 1, -1, 1);
    if (this.y > height) {
      this.y = random(-300, 0);
    }
    if (dist(this.x, this.y, rocketLocX, rocketLocY) < 100) {
      this.y = random(-300, 0);
      score -= 1;
      missSound.play();
    }
    this.noiseOffset += 0.01;

    imageMode(CENTER);
    image(brick, this.x, this.y,150,70);
  }
}

function Fuel() {
  // pick a random spot to fall from
  this.x = random(width);
  this.y = random(-300, 0);

  // perlin noise offest
  this.noiseOffset = random(1000);

  // draw and move
  this.drawAndMove = function() {
    this.y += speed;
    this.x += map(noise(this.noiseOffset), 0, 1, -1, 1);
    if (this.y > height) {
      this.y = random(-300, 0);
    }
    if (dist(this.x, this.y, rocketLocX, rocketLocY) < 100) {
      this.y = random(-300, 0);
      score += 1;
      scoreSound.play();
    }
    this.noiseOffset += 0.01;

    imageMode(CENTER);
    image(fuel, this.x, this.y,130,160);
  }
}