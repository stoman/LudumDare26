var canvas;
var context;
var player;
var enemies = [];
var highlights = [];
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
var soundIndex = {
    enemy_kill : 0,
    player_hit : 0
};
var pointsHistory = 10;
var colors = {
    player : '#339033',
    playerHistory : ['#eef8ee', '#eeecee', '#dde8dd', '#ddecdd', '#cce8cc',
	    '#ccdccc', '#bbd8bb', '#bbdcbb', '#aad8aa'],
    enemy : '#333390',
    enemyHistory : ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff',
	    '#eeeef8', '#dddde8', '#cccce8', '#bbbbd8', '#aaaad8'],
    debug : '#000000',
    explosion : ['#ffeeee', '#f8dddd', '#eecccc', '#e8bbbb', '#ddaaaa',
	    '#d79999', '#cc8888', '#c77777', '#bb6666', '#b65555', '#aa4444',
	    '#a63333', '#992222', '#951111', '#880000', '#850000'],
    birth : ['#eeffff', '#ddf8f8', '#cceeee', '#bbe8e8', '#aadddd', '#99d7d7',
	    '#88cccc', '#77c7c7', '#66bbbb', '#55b6b6', '#44aaaa', '#33a6a6',
	    '#229999', '#119595', '#008888', '#008585']
};

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
    
    // draw player
    player.render();
    
    // draw enemies
    for( var i = 0; i < enemies.length; i++) {
	enemies[i].render();
    }
    
    // draw highlights
    for( var i = 0; i < highlights.length; i++) {
	highlights[i].render();
    }
    
    context.fillStyle = colors.debug;
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
	    playSound('player_hit');
	    // remove enemy
	    enemies.splice(i, 1);
	    // add enemies
	    addEnemies(1);
	}
    }
    
    // between enemies
    var deadEnemies = [];
    for( var i = 0; i < enemies.length; i++) {
	for( var j = i + 1; j < enemies.length; j++) {
	    if(enemies[i].collidesWith(enemies[j])) {
		if(-1 == $.inArray(i, deadEnemies)) {
		    deadEnemies.push(i);
		}
		if(-1 == $.inArray(j, deadEnemies)) {
		    deadEnemies.push(j);
		}
	    }
	}
    }
    
    // remove dead enemies
    if(deadEnemies.length > 0) {
	// play sound
	playSound('enemy_kill');
	
	deadEnemies.sort().reverse();
	for( var i = 0; i < deadEnemies.length; i++) {
	    // add explosion
	    highlights.push(new Explosion(enemies[deadEnemies[i]].x,
		    enemies[deadEnemies[i]].y));
	    
	    // remove enemies
	    enemies.splice(deadEnemies[i], 1);
	}
    }
    
    // update highlights
    for( var i = highlights.length - 1; i >= 0; i--) {
	if(highlights[i].step == 0) {
	    highlights.splice(i, 1);
	}
	else {
	    highlights[i].updatePosition();
	}
    }
}

function playSound(name) {
    sound[name][soundIndex[name]].play();
    soundIndex[name] = (soundIndex[name] + 1) % sound[name].length;
    
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
    // create enemy
    var enemy = new Enemy(Math.random() * canvas.width, Math.random()
	    * canvas.height, Math.random() * 2 * Math.PI, 5 + Math.random(),
	    0.05 * Math.random() + 0.03);
    enemies.push(enemy);
    
    // add birth highlight
    highlights.push(new Birth(enemy.x, enemy.y));
}

function copyObject(target, source) {
    for( var p in source) {
	target[p] = source[p];
    }
}

function Explosion(x, y) {
    copyObject(this, new Highlight(x, y));
    
    this.render = function() {
	context.beginPath();
	context.arc(this.x, this.y, Math.ceil((this.step + 1) / 3), 0,
		2 * Math.PI, false);
	context.closePath();
	context.fillStyle = colors.explosion[this.step];
	context.fill();
    };
}

function Birth(x, y) {
    copyObject(this, new Highlight(x, y));
    
    this.render = function() {
	context.beginPath();
	context.arc(this.x, this.y, Math.ceil((this.step + 1) / 3), 0,
		2 * Math.PI, false);
	context.closePath();
	context.fillStyle = colors.birth[this.step];
	context.fill();
    };
}

function Highlight(x, y) {
    this.x = x;
    this.y = y;
    this.step = colors.explosion.length - 1;
    
    this.updatePosition = function() {
	this.step = Math.max(this.step - 1, 0);
    };
    
    this.render = function() {
	console.log('render not implemented');
    };
}

function Player(x, y, angle, speed, agility) {
    copyObject(this, new Thing(x, y, angle, speed, agility));
    this.collisionRadius = 5;
    
    this.render = function() {
	// history
	for( var i = 0; i < this.xHistory.length; i++) {
	    context.beginPath();
	    context.rect(this.xHistory[i] - (i + 1) / 2, this.yHistory[i]
		    - (i + 1) / 2, (i + 1), (i + 1));
	    context.closePath();
	    context.fillStyle = colors.playerHistory[i];
	    context.fill();
	}
	
	// object
	context.beginPath();
	context.rect(this.x - 5, this.y - 5, 10, 10);
	context.closePath();
	context.fillStyle = colors.player;
	context.fill();
    };
}

function Enemy(x, y, angle, speed, agility) {
    copyObject(this, new Thing(x, y, angle, speed, agility));
    
    this.render = function() {
	// history
	for( var i = 0; i < this.xHistory.length; i++) {
	    context.beginPath();
	    context.rect(this.xHistory[i] - 1, this.yHistory[i] - 1, 2, 2);
	    context.closePath();
	    context.fillStyle = colors.enemyHistory[i];
	    context.fill();
	}
	
	// object
	context.beginPath();
	context.rect(this.x - 2, this.y - 2, 4, 4);
	context.closePath();
	context.fillStyle = colors.enemy;
	context.fill();
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
	// save history
	this.xHistory.push(this.x);
	if(this.xHistory.length > pointsHistory) {
	    this.xHistory.splice(0, this.xHistory.length - pointsHistory);
	}
	this.yHistory.push(this.y);
	if(this.yHistory.length > pointsHistory) {
	    this.yHistory.splice(0, this.yHistory.length - pointsHistory);
	}
	
	// update
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