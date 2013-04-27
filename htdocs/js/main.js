var canvas;
var context;
var player;
var enemies = [];
var keysPressed = [];
var currentFrame = 0;
var frameRateStart = 0;
var frameRate = 0;
var sound = {
    background : [new Audio("sound/background_1.mp3"),
	    new Audio("sound/background_2.mp3"),
	    new Audio("sound/background_3.mp3"),
	    new Audio("sound/background_4.mp3")],
    enemy_kill : [new Audio("sound/enemy_kill_1.wav"),
	    new Audio("sound/enemy_kill_2.wav"),
	    new Audio("sound/enemy_kill_3.wav"),
	    new Audio("sound/enemy_kill_4.wav"),
	    new Audio("sound/enemy_kill_5.wav"),
	    new Audio("sound/enemy_kill_6.wav"),
	    new Audio("sound/enemy_kill_7.wav"),
	    new Audio("sound/enemy_kill_8.wav")],
    player_hit : [new Audio("sound/player_hit_1.wav"),
	    new Audio("sound/player_hit_2.wav"),
	    new Audio("sound/player_hit_3.wav"),
	    new Audio("sound/player_hit_4.wav")],
};
var sound_index = {
    enemy_kill : 0,
    player_hit : 0
};
var pointsHistory = 5;

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
    
    player = new Player(Math.random() * canvas.width, Math.random()
	    * canvas.height, Math.random() * 2 * Math.PI, 4, 0.1);
    addEnemies(10);
    
    playBackgroundMusic(0);
    
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
    
    // empty canvas
    canvas.height = canvas.height;
    
    // draw elements
    player.render();
    for( var i = 0; i < enemies.length; i++) {
	enemies[i].render();
    }
    
    context.fillText('fps: ' + frameRate, 10, 10);
    context.fillText('keysPressed: [' + keysPressed + ']', 10, 20);
    context.fillText('enemies: ' + enemies.length, 10, 30);
}

function update() {
    // update positions
    player.updatePosition();
    for( var i = 0; i < enemies.length; i++) {
	enemies[i].updatePosition();
    }
    
    // turn objects
    for( var i = 0; i < enemies.length; i++) {
	enemies[i].turnTowards(player);
    }
    
    // player
    // right: right arrow or d
    if(-1 != $.inArray(39, keysPressed) || -1 != $.inArray(68, keysPressed)) {
	player.turnRight();
    }
    // left: left arrow or a
    if(-1 != $.inArray(37, keysPressed) || -1 != $.inArray(65, keysPressed)) {
	player.turnLeft();
    }
    
    // detect collisions
    // player vs. enemy
    for( var i = enemies.length - 1; i >= 0; i--) {
	if(enemies[i].collidesWith(player)) {
	    // play sound
	    play_sound('player_hit');
	    // remove enemy
	    enemies.splice(i, 1);
	    // add enemies
	    addEnemies(5);
	}
    }
    
    // between enemies
    var deadEnemies = [];
    for( var i = 0; i < enemies.length; i++) {
	for( var j = i + 1; j < enemies.length; j++) {
	    if(enemies[i].collidesWith(enemies[j])) {
		deadEnemies.push(i);
		deadEnemies.push(j);
	    }
	}
    }
    
    // remove dead enemies
    if(deadEnemies.length > 0) {
	// play sound
	play_sound('enemy_kill');
	
	// remove enemies
	deadEnemies.sort().reverse();
	for( var i = 0; i < deadEnemies.length; i++) {
	    enemies.splice(deadEnemies[i], 1);
	}
    }
}

function play_sound(name) {
    sound[name][sound_index[name]].play();
    sound_index[name] = (sound_index[name] + 1) % sound[name].length;
    
}

function playBackgroundMusic(index) {
    sound.background[index].loop = true;
    sound.background[index].play();
}

function normalizeAngle(a) {
    a %= 2 * Math.PI;
    if(a < 0) {
	a += 2 * Math.PI;
    }
    return a;
}

function addEnemies(n) {
    for( var i = 0; i < n; i++) {
	addEnemy();
    }
}

function addEnemy() {
    enemies.push(new Enemy(Math.random() * canvas.width, Math.random()
	    * canvas.height, Math.random() * 2 * Math.PI, 5 + Math.random(),
	    0.05 * Math.random() + 0.03));
}

function copyObject(target, source) {
    for( var p in source) {
	target[p] = source[p];
    }
}

function Player(x, y, angle, speed, agility) {
    copyObject(this, new Thing(x, y, angle, speed, agility));
    this.collisionRadius = 5;
    
    this.render = function() {
	context.beginPath();
	context.rect(this.x - 5, this.y - 5, 10, 10);
	context.closePath();
	context.fill();
    };
}

function Enemy(x, y, angle, speed, agility) {
    copyObject(this, new Thing(x, y, angle, speed, agility));
    
    this.render = function() {
	context.beginPath();
	context.rect(this.x - 2, this.y - 2, 4, 4);
	context.closePath();
	context.fill();
	
	for( var i = 0; i < this.xHistory.length; i++) {
	    context.beginPath();
	    context.rect(this.xHistory[i] - 1, this.yHistory[i] - 1, 2, 2);
	    context.closePath();
	    context.fill();
	}
    };
}

function Thing(x, y, angle, speed, agility) {
    this.x = x;
    this.xHistory = [];
    this.y = y;
    this.yHistory = [];
    this.angle = angle;
    this.speed = speed;
    this.agility = agility;
    this.collisionRadius = 3;
    
    this.updatePosition = function() {
	if(currentFrame % 1 == 0) {
	    this.xHistory.push(this.x);
	    if(this.xHistory.length > pointsHistory) {
		this.xHistory.splice(0, this.xHistory.length - pointsHistory);
	    }
	    this.yHistory.push(this.y);
	    if(this.yHistory.length > pointsHistory) {
		this.yHistory.splice(0, this.yHistory.length - pointsHistory);
	    }
	}
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
	
	var targetAngle = Math.atan((target.x - this.x) / (target.y - this.y));
	if(target.y - this.y < 0) {
	    targetAngle += Math.PI;
	}
	targetAngle = normalizeAngle(targetAngle);
	
	if(targetAngle < Math.PI) {
	    if(this.angle - targetAngle > 0
		    && this.angle - targetAngle < Math.PI) {
		this.turnRight();
	    }
	    else {
		this.turnLeft();
	    }
	}
	else {
	    if(targetAngle - this.angle > 0
		    && targetAngle - this.angle < Math.PI) {
		this.turnLeft();
	    }
	    else {
		this.turnRight();
	    }
	}
    };
    
    this.collidesWith = function(target) {
	return this.collisionRadius + target.collisionRadius >= Math.abs(this.x
		- target.x)
		+ Math.abs(this.y - target.y);
    };
}