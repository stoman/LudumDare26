var canvas;
var context;
var player;
var keysPressed = [];
var currentFrame = 0;
var frameRateStart = 0;
var frameRate = 0;

$(function() {
	$(document).keydown(function(e) {
		if(-1 == $.inArray(e.keyCode, keysPressed)) {
			keysPressed.push(e.keyCode);
		}
	    return false;
	});
	$(document).keyup(function(e) {
		keysPressed = $.grep(keysPressed, function(value) {
			  return value != e.keyCode;
		});
	    return false;
	});
	
	canvas = document.getElementById('main-canvas');
	canvas.height = $('#main-canvas').height();
	canvas.width = $('#main-canvas').width();

	context = canvas.getContext('2d');
	player = new Player(100, 100, 0, 10, 0.1);
	
	setInterval(draw, 30);
	setInterval(update, 30);
	setInterval(measureFrameRate, 1000);
});

function measureFrameRate() {
	frameRate = currentFrame - frameRateStart;
	frameRateStart = currentFrame;
}

function draw() {
	currentFrame++;
	
	//empty canvas
	canvas.height = canvas.height;
	
	//draw elements
	player.render();
	
	context.fillText('fps: ' + frameRate, 10, 10);
	context.fillText('keysPressed: [' + keysPressed + ']', 10, 20);
}

function update() {
	//update positions
	player.updatePosition();
	
	//listen to key events
	//right: right arrow or d
	if(-1 != $.inArray(39, keysPressed) || -1 != $.inArray(68, keysPressed) ) {
		player.turnRight();
	}
	//left: left arrow or a
	if(-1 != $.inArray(37, keysPressed) || -1 != $.inArray(65, keysPressed) ) {
		player.turnLeft();
	}
}

function Player(x, y, angle, speed, agility) {
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.speed = speed;
	this.agility = agility;
	
	this.updatePosition = function() {
		this.x += this.speed * Math.sin(this.angle);
		this.y += this.speed * Math.cos(this.angle);
	};
	
	this.turnLeft = function() {
		this.angle += this.agility; 
	};
	
	this.turnRight = function() {
		this.angle -= this.agility; 
	};
	
	this.render = function() {
		context.beginPath();
		context.rect(this.x-5, this.y-5, 10, 10);
		context.closePath();
		context.fill();
	};
}