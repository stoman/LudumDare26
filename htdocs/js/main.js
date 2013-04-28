//canvas element
var canvas;
var context;

// game variables
var player;
var enemies;
var passersby;
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
var muted = false;

// cronjobs
var currentCronjobs = [];

// visuals and colors
var pointsHistory = 10;
var colors;

// level
var currentLevel = 10;
var levels;
var won = false;

// state
var readyToStart = true;

// stats
var stats = {
    enemyHit : 0,
    killsEnemy : 0,
    killsPasserby : 0,
    killsWall : 0,
    passerbyHit : 0,
    wallHit : 0
};

$(function() {
    // prepare canvas
    canvas = document.getElementById('main-canvas');
    canvas.height = $('#main-canvas').height();
    canvas.width = $('#main-canvas').width();
    context = canvas.getContext('2d');
    
    // create level objects
    levels = [
	    {// level 1
		backgroundIndex : 0,
		enemyAgilityBase : 0.01,
		enemyAgilityRandom : 0.03,
		enemySpeedBase : 3,
		enemySpeedRandom : 1,
		initialEnemies : 5,
		initialPassersby : 0,
		passerbyAgilityBase : 0.1,
		passerbyAgilityRandom : 0,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 0,
		penaltyWall : 1,
		penaltyEnemy : 1,
		penaltyPasserby : 1,
		playerAgility : 0.1,
		playerSpeed : 2,
		text : 'You stole a potato from the local supermarket. Fortunately, the guards are not that agile and can\'t corner sharply (Who expects somebody to steal potatoes?). Make them run against a wall to escape and enjoy your tasteful potato!',
		walls : [new Wall(0, 0, 15, canvas.height),// left
		new Wall(canvas.width - 15, 0, canvas.width, canvas.height),// right
		new Wall(0, 0, canvas.width, 15),// top
		new Wall(0, canvas.height - 15, canvas.width, canvas.height),// bottom
		],
		winFrames : 30
	    },
	    {// level 2
		backgroundIndex : 1,
		enemyAgilityBase : 0.04,
		enemyAgilityRandom : 0.03,
		enemySpeedBase : 3,
		enemySpeedRandom : 1,
		initialEnemies : 25,
		initialPassersby : 0,
		passerbyAgilityBase : 0.1,
		passerbyAgilityRandom : 0,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 0,
		penaltyWall : 1,
		penaltyEnemy : 1,
		penaltyPasserby : 1,
		playerAgility : 0.1,
		playerSpeed : 2,
		text : 'You escaped, but now they are warned! Sadly, you stole only one potato and are therefore still hungry. Get some more potatoes this time, but be aware that the guards got better and brought some colleagues. Afterwards you may finish lunch and take a trip down memory lane.',
		walls : [new Wall(0, 0, 15, canvas.height),// left
		new Wall(canvas.width - 15, 0, canvas.width, canvas.height),// right
		new Wall(0, 0, canvas.width, 15),// top
		new Wall(0, canvas.height - 15, canvas.width, canvas.height),// bottom
		],
		winFrames : 30
	    },
	    {// level 3
		backgroundIndex : 2,
		enemyAgilityBase : 0.04,
		enemyAgilityRandom : 0.03,
		enemySpeedBase : 4,
		enemySpeedRandom : 1,
		initialEnemies : 50,
		initialPassersby : 0,
		passerbyAgilityBase : 0.1,
		passerbyAgilityRandom : 0,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 0,
		penaltyWall : 1,
		penaltyEnemy : 1,
		penaltyPasserby : 1,
		playerAgility : 0.1,
		playerSpeed : 2,
		text : 'After lunch there is some time to think about the past. You have always been stealing. Long time ago you began shoplifting lollipops. The guards were faster, but there were also some buildings around. The corners saved you more than just once...',
		walls : [
			new Wall(0, 0, 15, canvas.height),// left
			new Wall(canvas.width - 15, 0, canvas.width,
				canvas.height),// right
			new Wall(0, 0, canvas.width, 15),// top
			new Wall(0, canvas.height - 15, canvas.width,
				canvas.height),// bottom
			new Wall(canvas.width / 3, canvas.height / 3,
				2 * canvas.width / 3, 2 * canvas.height / 3)// middle
		],
		winFrames : 30
	    },
	    {// level 4
		backgroundIndex : 3,
		enemyAgilityBase : 0.04,
		enemyAgilityRandom : 0.03,
		enemySpeedBase : 4,
		enemySpeedRandom : 1,
		initialEnemies : 100,
		initialPassersby : 0,
		passerbyAgilityBase : 0.1,
		passerbyAgilityRandom : 0,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 0,
		penaltyWall : 1,
		penaltyEnemy : 1,
		penaltyPasserby : 1,
		playerAgility : 0.1,
		playerSpeed : 3,
		text : 'You got better over time and began to look for more expensive things. Once you stole a laptop from some nerds. They were hard working as under time pressure. Don\'t know what the abbreviation on their screen meant...',
		walls : [new Wall(0, 0, 15, canvas.height),// left
		new Wall(canvas.width - 15, 0, canvas.width, canvas.height),// right
		new Wall(0, 0, canvas.width, 15),// top
		new Wall(0, canvas.height - 15, canvas.width, canvas.height),// bottom
		new Wall(125, 175, 145, 275),// L1 (left)
		new Wall(125, 255, 195, 275),// L2 (bottom)
		new Wall(215, 175, 235, 275),// D1 (left)
		new Wall(215, 255, 285, 275),// D2 (bottom)
		new Wall(265, 175, 285, 275),// D3 (right)
		new Wall(215, 175, 285, 195),// D4 (top)
		new Wall(315, 215, 335, 275),// 21 (left)
		new Wall(315, 255, 385, 275),// 22 (bottom)
		new Wall(365, 175, 385, 235),// 23 (right)
		new Wall(315, 175, 385, 195),// 24 (top)
		new Wall(315, 215, 385, 235),// 25 (middle)
		new Wall(405, 175, 425, 275),// 21 (left)
		new Wall(405, 255, 475, 275),// 22 (bottom)
		new Wall(455, 215, 475, 275),// 23 (right)
		new Wall(405, 175, 475, 195),// 24 (top)
		new Wall(405, 215, 475, 235),// 25 (middle)
		],
		winFrames : 30
	    },
	    {// level 5
		backgroundIndex : 0,
		enemyAgilityBase : 0.05,
		enemyAgilityRandom : 0.03,
		enemySpeedBase : 5,
		enemySpeedRandom : 1,
		initialEnemies : 25,
		initialPassersby : 0,
		passerbyAgilityBase : 0.1,
		passerbyAgilityRandom : 0,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 0,
		penaltyWall : 2,
		penaltyEnemy : 3,
		penaltyPasserby : 1,
		playerAgility : 0.1,
		playerSpeed : 4,
		text : 'When they saw you quite often, they knew that reinforcements were needed. Try not to be arrested. I mean, you should always do that, but this time, they will use your mistakes shamelessly.',
		walls : [new Wall(0, 0, 15, canvas.height),// left
		new Wall(canvas.width - 15, 0, canvas.width, canvas.height),// right
		new Wall(0, 0, canvas.width, 15),// top
		new Wall(0, canvas.height - 15, canvas.width, canvas.height)// bottom
		],
		winFrames : 30
	    },
	    {// level 6
		backgroundIndex : 1,
		enemyAgilityBase : 0.15,
		enemyAgilityRandom : 0.1,
		enemySpeedBase : 5,
		enemySpeedRandom : 1,
		initialEnemies : 100,
		initialPassersby : 0,
		passerbyAgilityBase : 0.1,
		passerbyAgilityRandom : 0,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 0,
		penaltyWall : 10,
		penaltyEnemy : 1,
		penaltyPasserby : 1,
		playerAgility : 0.1,
		playerSpeed : 4,
		text : 'One day you decided that it may be clever to steal where nobody knows you. It would have been even more clever to know the city before running through it. There are buildings everywhere. You have to stay alive when you killed all enemies for quite a long time to find your way out here. Hope the stolen gaming consoles are worth it.',
		walls : [new Wall(0, 0, 15, canvas.height),// left
		new Wall(canvas.width - 15, 0, canvas.width, canvas.height),// right
		new Wall(0, 0, canvas.width, 15),// top
		new Wall(0, canvas.height - 15, canvas.width, canvas.height)// bottom
		],
		winFrames : 100
	    },
	    {// level 7
		backgroundIndex : 2,
		enemyAgilityBase : 0.07,
		enemyAgilityRandom : 0.05,
		enemySpeedBase : 7,
		enemySpeedRandom : 2,
		initialEnemies : 100,
		initialPassersby : 0,
		passerbyAgilityBase : 0.1,
		passerbyAgilityRandom : 0,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 0,
		penaltyWall : 3,
		penaltyEnemy : 3,
		penaltyPasserby : 1,
		playerAgility : 0.15,
		playerSpeed : 5,
		text : 'The workout on this stolen treadmill was hard, but now you are much faster. It seems like the policemen used the other one they confiscated, because they got faster, too. Will you get the new couch to your home? You can\'t always steal treadmills... what about a new TV next?',
		walls : [new Wall(0, 0, 15, canvas.height),// left
		new Wall(canvas.width - 15, 0, canvas.width, canvas.height),// right
		new Wall(0, 0, canvas.width, 15),// top
		new Wall(0, canvas.height - 15, canvas.width, canvas.height)// bottom
		],
		winFrames : 30
	    },
	    {// level 8
		backgroundIndex : 3,
		enemyAgilityBase : 0.05,
		enemyAgilityRandom : 0.03,
		enemySpeedBase : 5,
		enemySpeedRandom : 1,
		initialEnemies : 25,
		initialPassersby : 25,
		passerbyAgilityBase : 0.05,
		passerbyAgilityRandom : 0.03,
		passerbySpeedBase : 0,
		passerbySpeedRandom : 0,
		penaltyWall : 2,
		penaltyEnemy : 3,
		penaltyPasserby : 50,
		playerAgility : 0.1,
		playerSpeed : 4,
		text : 'When shoplifting in pedestrian areas there are many bassersby around. These are the yellow guys. Don\'t need to get rid of them, they are just in your way. In fact, I can\'t recommend hitting them. Cops get really angry when you do this. But you will notice this on your own... Good news: They obstruct your enemies\' way too.',
		walls : [new Wall(0, 0, 15, canvas.height),// left
		new Wall(canvas.width - 15, 0, canvas.width, canvas.height),// right
		new Wall(0, 0, canvas.width, 15),// top
		new Wall(0, canvas.height - 15, canvas.width, canvas.height)// bottom
		],
		winFrames : 30
	    },
	    {// level 9
		backgroundIndex : 0,
		enemyAgilityBase : 0.05,
		enemyAgilityRandom : 0.03,
		enemySpeedBase : 4,
		enemySpeedRandom : 1,
		initialEnemies : 25,
		initialPassersby : 25,
		passerbyAgilityBase : 0.05,
		passerbyAgilityRandom : 0.03,
		passerbySpeedBase : 0.5,
		passerbySpeedRandom : 0.5,
		penaltyWall : 2,
		penaltyEnemy : 3,
		penaltyPasserby : 50,
		playerAgility : 0.1,
		playerSpeed : 3,
		text : 'Back to modern problems: These passersby are really annoying. All the time they are staring into their smartphones and don\'t look what is going on around them. They just move randomly around... Thankfully, this is no mobile game, as I don\'t want to insult you.',
		walls : [new Wall(0, 0, 15, canvas.height),// left
		new Wall(canvas.width - 15, 0, canvas.width, canvas.height),// right
		new Wall(0, 0, canvas.width, 15),// top
		new Wall(0, canvas.height - 15, canvas.width, canvas.height)// bottom
		],
		winFrames : 30
	    },
	    {// level 10
		backgroundIndex : 1,
		enemyAgilityBase : 0.05,
		enemyAgilityRandom : 0.03,
		enemySpeedBase : 4,
		enemySpeedRandom : 1,
		initialEnemies : 75,
		initialPassersby : 25,
		passerbyAgilityBase : 0.15,
		passerbyAgilityRandom : 0.03,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 0.5,
		penaltyWall : 5,
		penaltyEnemy : 5,
		penaltyPasserby : 50,
		playerAgility : 0.1,
		playerSpeed : 3,
		text : 'Who is the architect of this building? Did he think of poor shoplifters trying to escape the police when designing this mall?',
		walls : [new Wall(0, 0, 15, canvas.height),// left
		new Wall(canvas.width - 15, 0, canvas.width, canvas.height),// right
		new Wall(0, 0, canvas.width, 15),// top
		new Wall(0, canvas.height - 15, canvas.width, canvas.height)// bottom
		],
		winFrames : 70
	    },
	    {// level 11
		backgroundIndex : 3,
		enemyAgilityBase : 0.1,
		enemyAgilityRandom : 0.1,
		enemySpeedBase : 8,
		enemySpeedRandom : 2,
		initialEnemies : 200,
		initialPassersby : 15,
		passerbyAgilityBase : 0.15,
		passerbyAgilityRandom : 0.03,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 0.5,
		penaltyWall : 10,
		penaltyEnemy : 10,
		penaltyPasserby : 50,
		playerAgility : 0.1,
		playerSpeed : 6,
		text : 'This seems to be easier. There are lots of security guys which is normal for an airport. Wait... what should you steal at an airport? An airplane? You can\'t hide this under your coat...',
		walls : [
			new Wall(0, 0, 15, canvas.height),// left
			new Wall(canvas.width - 15, 0, canvas.width,
				canvas.height),// right
			new Wall(0, 0, canvas.width, 15),// top
			new Wall(0, canvas.height - 15, canvas.width,
				canvas.height),// bottom
			new Wall(canvas.width / 3, canvas.height / 3,
				canvas.width / 3 + 15, canvas.height * 2 / 3),// middle1
			new Wall(canvas.width * 2 / 3, canvas.height / 3,
				canvas.width * 2 / 3 + 15,
				canvas.height * 2 / 3),// middle2
		],
		winFrames : 30
	    },
	    {// level 12
		backgroundIndex : 3,
		enemyAgilityBase : 0.1,
		enemyAgilityRandom : 0.06,
		enemySpeedBase : 10,
		enemySpeedRandom : 3,
		initialEnemies : 50,
		initialPassersby : 20,
		passerbyAgilityBase : 0.1,
		passerbyAgilityRandom : 0,
		passerbySpeedBase : 1,
		passerbySpeedRandom : 1,
		penaltyWall : 15,
		penaltyEnemy : 15,
		penaltyPasserby : 50,
		playerAgility : 0.2,
		playerSpeed : 8,
		text : 'WTF is happening here? Can you master this last level?',
		walls : [new Wall(0, 0, 15, 450),// left
		new Wall(585, 0, 600, 450),// right
		new Wall(0, 0, 600, 15),// top
		new Wall(0, 435, 600, 450)// bottom
		],
		winFrames : 30
	    }];
    // level 6
    for( var x = 30; x < 450; x += 50) {
	levels[5].walls.push(new Wall(canvas.width / 2 - 7.5, x,
		canvas.width / 2 + 7.5, x + 15));
	levels[5].walls.push(new Wall(x, x, x + 15, x + 15));
	levels[5].walls.push(new Wall(canvas.width - x - 15, x, canvas.width
		- x, x + 15));
	levels[5].walls.push(new Wall(x, canvas.height - x - 15, x + 15,
		canvas.height - x));
	levels[5].walls.push(new Wall(canvas.width - x - 15, canvas.height - x
		- 15, canvas.width - x, canvas.height - x));
    }
    // level 10
    var tx = 50;
    var ty = 50;
    for( var i = 1; i < 50; i++) {
	tx = ((5 * i + (123 * tx)) % (canvas.width - 45)) + 15;
	ty = ((7 * i + (177 * ty)) % (canvas.height - 45)) + 15;
	console.log(ty);
	levels[9].walls.push(new Wall(tx, ty, tx + 15, ty + 15));
    }
    
    // compute colors
    colors = {
	player : 'rgb(200, 255, 200)',
	playerHistory : getGradient({
	    r : 0,
	    g : 0,
	    b : 0
	}, {
	    r : 100,
	    g : 200,
	    b : 100
	}, 10),
	enemy : 'rgb(50, 150, 255)',
	enemyHistory : getGradient({
	    r : 0,
	    g : 0,
	    b : 0
	}, {
	    r : 0,
	    g : 0,
	    b : 0
	}, 5).concat(getGradient({
	    r : 0,
	    g : 0,
	    b : 0
	}, {
	    r : 45,
	    g : 135,
	    b : 230
	}, 5)),
	passerby : 'rgb(255, 255, 0)',
	passerbyHistory : getGradient({
	    r : 0,
	    g : 0,
	    b : 0
	}, {
	    r : 200,
	    g : 200,
	    b : 0
	}, 10),
	debug : 'rgb(255, 255, 255)',
	explosion : getGradient({
	    r : 255,
	    g : 0,
	    b : 0
	}, {
	    r : 255,
	    g : 255,
	    b : 0
	}, 10),
	birth : getGradient({
	    r : 0,
	    g : 0,
	    b : 255
	}, {
	    r : 0,
	    g : 200,
	    b : 255
	}, 10),
	wall : 'rgb(255, 255, 255)',
	headings : 'rgb(255, 255, 255)',
	background : 'rgb(0, 0, 0)'
    };
    
    // add listeners
    $(document).keydown(function(e) {
	// start game with space
	if(e.keyCode == 32) {
	    startGame();
	}
	
	// pause
	if(e.keyCode == 80) {
	    stopGame();
	}
	
	// collect pressed keys
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
    
    // load first level
    loadLevel();
});

function loadLevel() {
    // create random position
    var pos = randomPosition(50);
    
    // add player
    player = new Player(pos.x, pos.y, Math.random() * 2 * Math.PI,
	    levels[currentLevel].playerSpeed,
	    levels[currentLevel].playerAgility);
    
    // initialize arrays
    enemies = [];
    highlights = [];
    passersby = [];
    keysPressed = [];
    currentFrame = 0;
    frameRateStart = 0;
    frameRate = 0;
    framesNoEnemy = 0;
    
    // add enemies
    addEnemies(levels[currentLevel].initialEnemies, false);
    
    // add passersby
    addPassersby(levels[currentLevel].initialPassersby, false);
    
    // play background music
    currentBackground = playBackgroundMusic(levels[currentLevel].backgroundIndex);
    
    // draw first frame
    draw();
}

function startGame() {
    if(readyToStart && !won) {
	// hide instructions
	hideInstructions();
	
	// add cronjobs
	currentCronjobs.push(setInterval(draw, 30));
	currentCronjobs.push(setInterval(update, 30));
	currentCronjobs.push(setInterval(measureFrameRate, 1000));
	currentCronjobs.push(setInterval(refreshStats, 1000));
	readyToStart = false;
	
	// show/hide links
	$('#start-game').hide();
	$('#stop-game').show();
    }
    else if(won) {
	restartGame();
    }
}

function stopGame() {
    // stop cronjobs
    for( var i = 0; i < currentCronjobs.length; i++) {
	clearInterval(currentCronjobs[i]);
    }
    currentCronjobs = [];
    
    // adjust variables
    readyToStart = true;
    
    // redraw
    draw();
    
    // show/hide links
    $('#start-game').show();
    $('#stop-game').hide();
}

function nextLevel() {
    if(currentLevel < levels.length - 1) {
	// stop background music
	currentBackground.pause();
	
	// load next level
	currentLevel++;
	loadLevel();
	refreshStats();
    }
    else {
	// game won
	$('#game-won').show('slide', {
	    direction : 'up'
	}, 'slow');
	won = true;
	draw();
    }
}

function restartGame() {
    if(won) {
	// stop background music
	currentBackground.pause();
	
	// reset variables
	$('#game-won').hide();
	stats = {
	    enemyHit : 0,
	    killsEnemy : 0,
	    killsPasserby : 0,
	    killsWall : 0,
	    passersbyHit : 0,
	    wallHit : 0
	};
	currentLevel = 0;
	won = false;
	
	// load new level
	loadLevel();
	
	// refresh stats
	refreshStats();
    }
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
    
    // draw passersby
    for( var i = 0; i < passersby.length; i++) {
	passersby[i].render();
    }
    
    // draw player
    player.render();
    
    // draw highlights
    for( var i = 0; i < highlights.length; i++) {
	highlights[i].render();
    }
    
    // texts
    if(!won && (currentFrame <= 50 || readyToStart)) {
	// level X
	context.font = '60pt Calibri';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.lineWidth = 3;
	context.strokeStyle = colors.headings;
	context.strokeText('Level ' + (currentLevel + 1), canvas.width / 2,
		canvas.height / 4);
	
	// helpt text
	context.font = '15pt Calibri';
	context.fillStyle = colors.headings;
	var words = levels[currentLevel].text.split(' ');
	var currentLine = '';
	var y = canvas.height * 3 / 4;
	for( var i = 0; i < words.length; i++) {
	    if(context.measureText(currentLine + ' ' + words[i]).width + 40 < canvas.width) {
		// attach word to line
		currentLine += ' ' + words[i];
	    }
	    else {
		// output
		context.fillText(currentLine, canvas.width / 2, y);
		y += 20;
		
		// create new line
		currentLine = words[i];
	    }
	}
	// last line
	context.fillText(currentLine, canvas.width / 2, y);
	
	// Ready? Go!
	if(readyToStart) {
	    context.strokeStyle = colors.background;
	    context.lineWidth = 5;
	    context.font = '25pt Calibri';
	    context.strokeText('Click to start or press the space key.',
		    canvas.width / 2, canvas.height / 2);
	    context.fillText('Click to start or press the space key.',
		    canvas.width / 2, canvas.height / 2);
	}
	else if(currentFrame <= 30) {
	    context.lineWidth = 6;
	    context.font = '100pt Calibri';
	    context.fillStyle = colors.background;
	    context.strokeText('Ready?', canvas.width / 2, canvas.height / 2);
	    context.fillText('Ready?', canvas.width / 2, canvas.height / 2);
	}
	else {
	    context.lineWidth = 7;
	    context.font = '140pt Calibri';
	    context.fillStyle = colors.background;
	    context.strokeText('Go!', canvas.width / 2, canvas.height / 2);
	    context.fillText('Go!', canvas.width / 2, canvas.height / 2);
	}
    }
    
    // debug messages
    context.font = '10pt Calibri';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillStyle = colors.debug;
    context.fillText('fps: ' + frameRate, 20, 20);
    context.fillText('keysPressed: [' + keysPressed + ']', 20, 30);
    context.fillText('enemies: ' + enemies.length, 20, 40);
}

function update() {
    // Ready? Go!
    if(currentFrame <= 50) {
	return;
    }
    
    // update positions
    player.updatePosition();
    for( var i = 0; i < enemies.length; i++) {
	enemies[i].updatePosition();
    }
    for( var i = 0; i < passersby.length; i++) {
	passersby[i].updatePosition();
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
	    // stats
	    stats.enemyHit++;
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
	    // stats
	    stats.wallHit++;
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
    
    // player vs. passersby
    for( var i = passersby.length - 1; i >= 0; i--) {
	if(passersby[i].collidesWith(player)) {
	    // stats
	    stats.passerbyHit++;
	    // play sound
	    playSound('player_hit');
	    // add explosion
	    highlights.push(new Explosion(player.x, player.y));
	    // add enemies
	    addEnemies(levels[currentLevel].penaltyPasserby, true);
	    // remove passerby
	    passersby.splice(i, 1);
	}
    }
    
    // passersby vs. wall
    for( var i = 0; i < levels[currentLevel].walls.length; i++) {
	for( var j = 0; j < passersby.length; j++) {
	    if(levels[currentLevel].walls[i].collidesWith(passersby[j])) {
		// adjust passerby
		passersby[j].angle += Math.PI;
		passersby[j].updatePosition();
		passersby[j].angle = 2 * Math.PI * Math.random();
	    }
	}
    }
    
    // enemies
    var deadEnemies = [];
    for( var i = 0; i < enemies.length; i++) {
	// enemy vs. wall
	for( var j = 0; j < levels[currentLevel].walls.length; j++) {
	    if(levels[currentLevel].walls[j].collidesWith(enemies[i])) {
		if(-1 == $.inArray(i, deadEnemies)) {
		    // stats
		    stats.killsWall++;
		    
		    // kill enemy
		    deadEnemies.push(i);
		}
	    }
	}
	
	// enemy vs. passerby
	for( var j = 0; j < passersby.length; j++) {
	    if(passersby[j].collidesWith(enemies[i])) {
		if(-1 == $.inArray(i, deadEnemies)) {
		    // stats
		    stats.killsPasserby++;
		    
		    // kill enemy
		    deadEnemies.push(i);
		}
	    }
	}
	
	// between enemies
	for( var j = i + 1; j < enemies.length; j++) {
	    if(enemies[i].collidesWith(enemies[j])) {
		if(-1 == $.inArray(i, deadEnemies)) {
		    // stats
		    stats.killsEnemy++;
		    
		    // kill enemy
		    deadEnemies.push(i);
		}
		if(-1 == $.inArray(j, deadEnemies)) {
		    // stats
		    stats.killsEnemy++;
		    
		    // kill enemy
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
	stopGame();
	nextLevel();
    }
}

function hideInstructions() {
    $('#instructions').hide();
    $('#show-instructions').show();
    $('#hide-instructions').hide();
}

function showInstructions() {
    // stop game
    stopGame();
    
    // show controls
    $('#instructions').show();
    $('#show-instructions').hide();
    $('#hide-instructions').show();
}

function playSound(name) {
    if(!muted) {
	sounds[name][soundIndex[name]].play();
	soundIndex[name] = (soundIndex[name] + 1) % sounds[name].length;
    }
}

function playBackgroundMusic(index) {
    sounds.background[index].loop = true;
    if(!muted) {
	sounds.background[index].play();
    }
    return sounds.background[index];
}

function mute() {
    muted = true;
    if(currentBackground != undefined) {
	currentBackground.pause();
    }
    $('#mute').html('Unmute').addClass('muted').removeClass('mute');
}

function unmute() {
    muted = false;
    if(currentBackground != undefined) {
	currentBackground.play();
    }
    $('#mute').html('Mute').removeClass('muted').addClass('mute');
}

function toggleMute() {
    if(muted) {
	unmute();
    }
    else {
	mute();
    }
}

function normalizeAngle(a) {
    a %= 2 * Math.PI;
    if(a < 0) {
	a += 2 * Math.PI;
    }
    return a;
}

function getGradient(start, end, size) {
    ret = [];
    for( var i = 0; i < size; i++) {
	ret.push('rgb('
		+ Math.round((start.r * (size - 1 - i) + end.r * i)
			/ (size - 1))
		+ ','
		+ Math.round((start.g * (size - 1 - i) + end.g * i)
			/ (size - 1))
		+ ','
		+ Math.round((start.b * (size - 1 - i) + end.b * i)
			/ (size - 1)) + ')');
    }
    return ret;
}

function addEnemies(n, showHighlight) {
    for( var i = 0; i < n; i++) {
	addEnemy(showHighlight);
    }
}

function addEnemy(showHighlight) {
    // create random position
    var pos = randomPosition(10);
    
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

function addPassersby(n) {
    for( var i = 0; i < n; i++) {
	addPasserby();
    }
}

function addPasserby() {
    // create random position
    var pos = randomPosition(10);
    
    // create passerby
    var passerby = new Passerby(pos.x, pos.y, Math.random() * 2 * Math.PI,
	    levels[currentLevel].passerbySpeedBase
		    + levels[currentLevel].passerbySpeedRandom * Math.random(),
	    levels[currentLevel].passerbyAgilityBase
		    + levels[currentLevel].passerbyAgilityRandom
		    * Math.random());
    passersby.push(passerby);
}

function randomPosition(collisionRadius) {
    // compute position
    var pos = new Position(Math.random() * canvas.width, Math.random()
	    * canvas.height);
    pos.collisionRadius = collisionRadius;
    
    // check for collisions
    for( var i = 0; i < levels[currentLevel].walls.length; i++) {
	if(levels[currentLevel].walls[i].collidesWith(pos)) {
	    // try again
	    return randomPosition(collisionRadius);
	}
    }
    
    // no collisions
    return pos;
}

function refreshStats() {
    // variables from stats array
    for( var name in stats) {
	if($('#' + name).html() != stats[name]) {
	    $('#' + name).hide().html(stats[name]).show('slide', {
		direction : 'down'
	    }, 200);
	}
    }
    
    // count enemies
    if($('#enemies').html() != enemies.length) {
	$('#enemies').hide().html(enemies.length).show('slide', {
	    direction : 'down'
	}, 200);
    }
    
    // current level
    if($('#level').html() != currentLevel + 1) {
	$('#level').hide().html(currentLevel + 1).show('slide', {
	    direction : 'down'
	}, 200);
	if(currentLevel == 0) {
	    $('#level-description').html('st level');
	}
	else if(currentLevel == 1) {
	    $('#level-description').html('nd level');
	}
	else if(currentLevel == 2) {
	    $('#level-description').html('rd level');
	}
	else {
	    $('#level-description').html('th level');
	}
    }
    
    // hits (game-won screen)
    $('#hits').html(stats.enemyHit + stats.wallHit + stats.passerbyHit);
}

// //////////////////////////////////////////////////////////////////////
// Objects
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
	context.arc(this.x, this.y, this.step + 1, 0, 2 * Math.PI, false);
	context.closePath();
	context.fillStyle = colors.explosion[this.step];
	context.fill();
    };
}

function Birth(x, y) {
    copyObject(this, new Highlight(x, y));
    
    this.render = function() {
	context.beginPath();
	context.arc(this.x, this.y, this.step + 1, 0, 2 * Math.PI, false);
	context.closePath();
	context.fillStyle = colors.birth[this.step];
	context.fill();
    };
}

function Highlight(x, y) {
    // extends Position
    copyObject(this, new Position(x, y));
    
    this.step = colors.explosion.length - 1;
    
    // compute the object's next position
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

function Passerby(x, y, angle, speed, agility) {
    // extend Thing
    copyObject(this, new Thing(x, y, angle, speed, agility));
    
    this.collisionRadius = 5;
    
    // render the object
    this.render = function() {
	// history
	for( var i = 0; i < this.xHistory.length; i++) {
	    context.beginPath();
	    context.rect(this.xHistory[i] - 5 + (this.xHistory.length - i) / 2,
		    this.yHistory[i] - 5 + (this.xHistory.length - i) / 2,
		    10 - (this.xHistory.length - i),
		    10 - (this.xHistory.length - i) / 2);
	    context.closePath();
	    context.fillStyle = colors.passerbyHistory[i];
	    context.fill();
	}
	
	// object
	context.beginPath();
	context.rect(this.x - 5, this.y - 5, 10, 10);
	context.closePath();
	context.fillStyle = colors.passerby;
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
    
    // compute the object's next position
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