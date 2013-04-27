//canvas element
var canvas;
var context;

// game variables
var player;
var enemies;
var highlights;
var keysPressed;

// frame rates
var currentFrame;
var frameRateStart;
var frameRate;
var framesNoEnemy;

// sounds
var sounds = {
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
var currentBackground;

// cronjobs
var currentCronjobs = [];

// visuals and colors
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
	    '#229999', '#119595', '#008888', '#008585'],
    wall : '#c0c0c0',
    headings : '#303030'
};

// level
var currentLevel = 0;
var levels;

// state
var readyToStart = false;

$(function() {
    // create level objects
    levels = [{// level 1
	backgroundIndex : 0,
	enemyAgilityBase : 0.05 - 0.05,
	enemyAgilityRandom : 0.03,
	enemySpeedBase : 5,
	enemySpeedRandom : 1,
	initialEnemies : 10,
	penaltyWall : 3,
	penaltyEnemy : 3,
	playerAgility : 0.1,
	playerSpeed : 4,
	walls : [new Wall(0, 0, 15, 450),// left
	new Wall(585, 0, 600, 450),// right
	new Wall(0, 0, 600, 15),// top
	new Wall(0, 435, 600, 450)// bottom
	],
	winFrames : 30
    }, {// level 2
	backgroundIndex : 1,
	enemyAgilityBase : 0.1,
	enemyAgilityRandom : 0.06,
	enemySpeedBase : 10,
	enemySpeedRandom : 2,
	initialEnemies : 50,
	penaltyWall : 5,
	penaltyEnemy : 5,
	playerAgility : 0.2,
	playerSpeed : 8,
	walls : [new Wall(0, 0, 15, 450),// left
	new Wall(585, 0, 600, 450),// right
	new Wall(0, 0, 600, 15),// top
	new Wall(0, 435, 600, 450)// bottom
	],
	winFrames : 30
    }];
    
    // add listeners
    $(document).keydown(function(e) {
	startGame();
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
    $('#main-canvas').click(function() {
	startGame();
    });
    
    // prepare canvas
    canvas = document.getElementById('main-canvas');
    canvas.height = $('#main-canvas').height();
    canvas.width = $('#main-canvas').width();
    context = canvas.getContext('2d');
    
    // load first level
    loadLevel();
});

function loadLevel() {
    // create random position
    var pos = randomPosition();
    
    // add player
    player = new Player(pos.x, pos.y, Math.random() * 2 * Math.PI,
	    levels[currentLevel].playerSpeed,
	    levels[currentLevel].playerAgility);
    
    // initialize arrays
    enemies = [];
    highlights = [];
    keysPressed = [];
    currentFrame = 0;
    frameRateStart = 0;
    frameRate = 0;
    framesNoEnemy = 0;
    
    // add enemies
    addEnemies(levels[currentLevel].initialEnemies, false);
    
    // play background music
    currentBackground = playBackgroundMusic(levels[currentLevel].backgroundIndex);
    
    // mark as ready
    readyToStart = true;
    
    // draw first frame
    draw();
}

function startGame() {
    if(readyToStart) {
	// add cronjobs
	currentCronjobs.push(setInterval(draw, 30));
	setTimeout(function() {
	    currentCronjobs.push(setInterval(update, 30));
	}, 1500);
	currentCronjobs.push(setInterval(measureFrameRate, 1000));
	readyToStart = false;
    }
}

function stopLevel() {
    // stop background music
    currentBackground.pause();
    
    // stop cronjobs
    for( var i = 0; i < currentCronjobs.length; i++) {
	clearInterval(currentCronjobs[i]);
    }
    currentCronjobs = [];
}

function nextLevel() {
    currentLevel++;
    loadLevel();
}

function measureFrameRate() {
    frameRate = currentFrame - frameRateStart;
    frameRateStart = currentFrame;
}

function draw() {
    currentFrame++;
    
    // empty canvas
    canvas.height = canvas.height;
    
    // draw levels[currentLevel].walls
    for( var i = 0; i < levels[currentLevel].walls.length; i++) {
	levels[currentLevel].walls[i].render();
    }
    
    // draw enemies
    for( var i = 0; i < enemies.length; i++) {
	enemies[i].render();
    }
    
    // draw player
    player.render();
    
    // draw highlights
    for( var i = 0; i < highlights.length; i++) {
	highlights[i].render();
    }
    
    // texts
    if(currentFrame <= 50) {
	context.font = '60pt Calibri';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.lineWidth = 3;
	context.strokeStyle = colors.headings;
	context.strokeText('Level ' + (currentLevel + 1), canvas.width / 2,
		canvas.height / 3);
	if(currentFrame <= 1) {
	    context.font = '30pt Calibri';
	    context.fillStyle = colors.headings;
	    context.fillText('Click to start or press any key.',
		    canvas.width / 2, canvas.height * 2 / 3);
	}
	else if(currentFrame <= 30) {
	    context.lineWidth = 4;
	    context.font = '100pt Calibri';
	    context.strokeText('Ready?', canvas.width / 2,
		    canvas.height * 2 / 3);
	}
	else {
	    context.lineWidth = 5;
	    context.font = '140pt Calibri';
	    context.strokeText('Go!', canvas.width / 2, canvas.height * 2 / 3);
	}
    }
    
    // debug messages
    context.font = '10pt Calibri';
    context.textAlign = 'left';
    context.textBaseline = 'top';
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
	    addEnemies(levels[currentLevel].penaltyEnemy, true);
	}
    }
    
    // player vs. wall
    for( var i = 0; i < levels[currentLevel].walls.length; i++) {
	if(levels[currentLevel].walls[i].collidesWith(player)) {
	    // play sound
	    playSound('player_hit');
	    // add explosion
	    highlights.push(new Explosion(player.x, player.y));
	    // add enemies
	    addEnemies(levels[currentLevel].penaltyWall, true);
	    // adjust player
	    player.angle += Math.PI;
	    player.updatePosition();
	    player.angle = 2 * Math.PI * Math.random();
	}
    }
    
    // enemies
    var deadEnemies = [];
    for( var i = 0; i < enemies.length; i++) {
	// enemy vs. wall
	for( var j = 0; j < levels[currentLevel].walls.length; j++) {
	    if(levels[currentLevel].walls[j].collidesWith(enemies[i])) {
		if(-1 == $.inArray(i, deadEnemies)) {
		    deadEnemies.push(i);
		}
	    }
	}
	// between enemies
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
	
	deadEnemies.sort(function(a, b) {
	    return b - a;
	});
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
    
    // increment number of fremes without enemies
    if(enemies.length == 0) {
	framesNoEnemy++;
    }
    else {
	framesNoEnemy = 0;
    }
    
    // won?
    if(framesNoEnemy >= levels[currentLevel].winFrames) {
	stopLevel();
	nextLevel();
    }
}

function playSound(name) {
    sounds[name][soundIndex[name]].play();
    soundIndex[name] = (soundIndex[name] + 1) % sounds[name].length;
    
}

function playBackgroundMusic(index) {
    sounds.background[index].loop = true;
    sounds.background[index].play();
    return sounds.background[index];
}

function normalizeAngle(a) {
    a %= 2 * Math.PI;
    if(a < 0) {
	a += 2 * Math.PI;
    }
    return a;
}

function addEnemies(n, showHighlight) {
    for( var i = 0; i < n; i++) {
	addEnemy(showHighlight);
    }
}

function addEnemy(showHighlight) {
    // create random position
    var pos = randomPosition();
    
    // create enemy
    var enemy = new Enemy(pos.x, pos.y, Math.random() * 2 * Math.PI,
	    levels[currentLevel].enemySpeedBase
		    + levels[currentLevel].enemySpeedRandom * Math.random(),
	    levels[currentLevel].enemyAgilityBase
		    + levels[currentLevel].enemyAgilityRandom * Math.random());
    enemies.push(enemy);
    
    // add birth highlight
    if(showHighlight) {
	highlights.push(new Birth(enemy.x, enemy.y));
    }
}

function randomPosition() {
    // compute position
    var pos = new Position(Math.random() * canvas.width, Math.random()
	    * canvas.height);
    
    // check for collisions
    for( var i = 0; i < levels[currentLevel].walls.length; i++) {
	if(levels[currentLevel].walls[i].collidesWith(pos)) {
	    // try again
	    return randomPosition();
	}
    }
    return pos;
}

function copyObject(target, source) {
    // copy all attributes and methods
    for( var p in source) {
	target[p] = source[p];
    }
}

function Wall(xMin, yMin, xMax, yMax) {
    this.xMin = xMin;
    this.yMin = yMin;
    this.xMax = xMax;
    this.yMax = yMax;
    
    // render the object
    this.render = function() {
	context.beginPath();
	context.rect(this.xMin, this.yMin, this.xMax - this.xMin, this.yMax
		- this.yMin);
	context.closePath();
	context.fillStyle = colors.wall;
	context.fill();
    };
    
    // test for collisions
    this.collidesXWith = function(target) {
	return this.xMin < target.x + target.collisionRadius
		&& target.x - target.collisionRadius < this.xMax;
    };
    
    this.collidesYWith = function(target) {
	return this.yMin < target.y + target.collisionRadius
		&& target.y - target.collisionRadius < this.yMax;
    };
    
    this.collidesWith = function(target) {
	return this.collidesXWith(target) && this.collidesYWith(target);
    };
}

function Explosion(x, y) {
    // extends Highlight
    copyObject(this, new Highlight(x, y));
    
    // render the object
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
    // extends Position
    copyObject(this, new Position(x, y));
    
    this.step = colors.explosion.length - 1;
    
    //compute the object's next position
    this.updatePosition = function() {
	this.step = Math.max(this.step - 1, 0);
    };
    
    // render the object
    this.render = function() {
	console.log('render not implemented');
    };
}

function Player(x, y, angle, speed, agility) {
    // extend Thing
    copyObject(this, new Thing(x, y, angle, speed, agility));
    
    this.collisionRadius = 5;
    
    // render the object
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
    // extend Thing
    copyObject(this, new Thing(x, y, angle, speed, agility));
    
    // render the object
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
    // extend Position
    copyObject(this, new Position(x, y));
    
    this.xHistory = [];
    this.yHistory = [];
    this.angle = angle;
    this.speed = speed;
    this.agility = agility;
    this.collisionRadius = 3;
    
    //compute the object's next position
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
    
    // turn around
    this.turnLeft = function() {
	this.angle += this.agility;
    };
    
    this.turnRight = function() {
	this.angle -= this.agility;
    };
    
    this.normalizeAngle = function() {
	this.angle = normalizeAngle(this.angle);
    };
    
    this.turnTowards = function(target) {
	this.normalizeAngle();
	
	// compute angle to target object
	var targetAngle = Math.atan((target.x - this.x) / (target.y - this.y));
	if(target.y - this.y < 0) {
	    targetAngle += Math.PI;
	}
	targetAngle = normalizeAngle(targetAngle);
	
	// decide in which direction to turn
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
    
    // render the object
    this.render = function() {
	console.log('render not implemented');
    };
    
    // test for collisions
    this.collidesWith = function(target) {
	return this.collisionRadius + target.collisionRadius >= Math.abs(this.x
		- target.x)
		+ Math.abs(this.y - target.y);
    };
}

function Position(x, y) {
    this.x = x;
    this.y = y;
}