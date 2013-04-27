var canvas;
var context;
var player;
var enemies = [];
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
	
	player = new Player(
		Math.random() * canvas.width,
		Math.random() * canvas.height,
		Math.random() * 2 * Math.PI,
		10,
		0.1
	);
	for(var i = 0; i < 5; i++) {
		enemies.push(new Enemy(
			Math.random() * canvas.width,
			Math.random() * canvas.height,
			Math.random() * 2 * Math.PI,
			5 + Math.random(),
			0.2 * Math.random()
		));
	}
	
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
	for(var i = 0; i < enemies.length; i++) {
		enemies[i].render();
	}
	
	context.fillText('fps: ' + frameRate, 10, 10);
	context.fillText('keysPressed: [' + keysPressed + ']', 10, 20);
}

function update() {
	//update positions
	player.updatePosition();
	for(var i = 0; i < enemies.length; i++) {
		enemies[i].updatePosition();
	}
	
	//turn objects
	for(var i = 0; i < enemies.length; i++) {
		enemies[i].turnTowards(player);
	}
	
	//player
	//right: right arrow or d
	if(-1 != $.inArray(39, keysPressed) || -1 != $.inArray(68, keysPressed) ) {
		player.turnRight();
	}
	//left: left arrow or a
	if(-1 != $.inArray(37, keysPressed) || -1 != $.inArray(65, keysPressed) ) {
		player.turnLeft();
	}
}

function normalizeAngle(a) {
	a %= 2*Math.PI;
	if(a < 0) {
		a += 2*Math.PI;
	}
	return a;
}

function copyObject(target, source) {
	for(var p in source) {
		target[p] = source[p];
	} 
}

function Player(x, y, angle, speed, agility) {
	copyObject(this, new Thing(x, y, angle, speed, agility));
	
	this.render = function() {
		context.beginPath();
		context.rect(this.x-5, this.y-5, 10, 10);
		context.closePath();
		context.fill();
	};
}
	
function Enemy(x, y, angle, speed, agility) {
	copyObject(this, new Thing(x, y, angle, speed, agility));
	
	this.render = function() {
		context.beginPath();
		context.rect(this.x-2, this.y-2, 4, 4);
		context.closePath();
		context.fill();
		
		var targetAngle = Math.atan((player.x-this.x) / (player.y-this.y));
		if(player.y-this.y < 0) {
			targetAngle += Math.PI;
		}
		targetAngle = normalizeAngle(targetAngle);
		
		context.beginPath();
		context.rect(this.x-1 + 10 * Math.sin(targetAngle), this.y-1 + 10 * Math.cos(targetAngle), 2, 2);
		context.closePath();
		context.fill();
	};
}
	
function Thing(x, y, angle, speed, agility) {
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
		console.log('render not implemented');
	};
	
	this.normalizeAngle = function() {
		this.angle = normalizeAngle(this.angle);
	};
	
	this.turnTowards = function(target) {
		this.normalizeAngle();
		
		var targetAngle = Math.atan((target.x-this.x) / (target.y-this.y));
		if(target.y-this.y < 0) {
			targetAngle += Math.PI;
		}
		targetAngle = normalizeAngle(targetAngle);
		
		if(targetAngle < Math.PI) {
			if(this.angle - targetAngle > 0 && this.angle - targetAngle < Math.PI) {
				this.turnRight();
			}
			else {
				this.turnLeft();
			}
		}
		else {
			if(targetAngle - this.angle > 0 && targetAngle - this.angle < Math.PI) {
				this.turnLeft();
			}
			else {
				this.turnRight();
			}
		}
	};
}