startGame = function() {
	stateCounter = 0;
	state = 0;
	gameArea.start();
	load = [];
	loadComponents();
}

loadComponents = function() {
	background = new planet(1450, 1450, 480, 540, "background.png");
	backgroundShade = new shadow(960, 540, 480, 270, "backShade.png", config.backgroundShadeAmount);
	planet = new planet(600, 600, 480, 540, "bluePlanet.png");
	planetShade = new shadow(600, 600, 480, 540, "planetShade.png", config.planetShadeAmount);
	ship = new shipPart(64, 64, 480, 100, "blueShip.png");
}

config = {
	updatePeriod : 20, // Lower: more screen updates per second. Keep this at 20.
	shaders : true, // Purely visual. Adds shadows everywhere.
	planetShadeAmount : 0.3, // Transparency of the planet shadow. Values range from 1 (dark) to 0 (no shadow).
	backgroundShadeAmount : 0.3, // Transparency of the background shadow. Values range from 1 (dark) to 0 (no shadow).
	rotateLeftKey : 68, // Key used to rotate things to the left.
	rotateRightKey : 65, // Key used to rotate things to the right.
	thrustKey : 87, // Key used to turn the ship's thrusters on. 
	rotationDecay : 0.95 // Decaying speed of planet rotation when a key is not pressed. Ranges from 1 (No decay) to 0 (Insta-stop).
}

gameArea = {
	canvas : document.createElement('canvas'),
	start : function() {
		this.canvas.width = 960;
		this.canvas.height = 540;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, config.updatePeriod);
		window.addEventListener('keydown', function (e) {
			gameArea.keys = (gameArea.keys || []);
			gameArea.keys[e.keyCode] = true;
		})
		window.addEventListener('keyup', function (e) {
			gameArea.keys[e.keyCode] = false;
		})
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	load : function(state) {
		switch (state) {
			case 0:
				for (var i = 0; i < load.length; i++) {load[i].update();}
			break;
			case 1:
			break;
			default:
			break;
		}
	},
	getInput : function() {
		/*
		State 0: (planet view) view of a planet
		State 1: (colonize view) view of a planet, able to edit buildings on it
		State 2: (attack view) view of a planet, able to attack buildings on it
		State 3: (map view) view of the map, able to travel to different systems
		*/
		if (gameArea.keys && gameArea.keys[config.thrustKey] && ship.rotation > -10 * Math.PI / 180 && ship.rotation < 10 * Math.PI / 180) {
			stateCounter ++; 
		} else if (stateCounter > 0) {
			stateCounter--;
		}
		if (stateCounter == 100) {
			stateCounter = 0;
			// state = 1; COMMENTED OUT SO THAT THE DEVELOPMENT BRANCH DOESN'T HAVE ANY LOOSE ENDS.
		}
	}
}

function planet(width, height, x, y, source) {
	load.push(this);
	this.image = new Image();
	this.image.src = source;
	this.width = width;
	this.height = height;
	this.x = x - this.width / 2;
	this.y = y - this.height / 2;
	this.rotation = 0;
	this.speed = 0;
	this.update = function() {
		if (gameArea.keys && gameArea.keys[config.thrustKey] && ship.rotation > 10 * Math.PI / 180 && ship.rotation < 170 * Math.PI / 180) {
			this.speed -= (this.speed + 0.1) * (1 * Math.PI / 180); 
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && ship.rotation < -10 * Math.PI / 180 && ship.rotation > -170 * Math.PI / 180) {
			this.speed += (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		this.speed = this.speed * config.rotationDecay;
		if (this.speed > 1 * Math.PI / 180) {
			this.speed = 1 * Math.PI / 180;
		} else if (this.speed < -1 * Math.PI / 180) {
			this.speed = -1 * Math.PI / 180;
		}
		this.rotation += this.speed;
		this.midpoint = [
			(this.x + (this.width + this.x)) / 2, 
			(this.y + (this.height + this.y)) / 2
		];
		this.midpointNew = [
			this.midpoint[1] * Math.sin(-this.rotation) + this.midpoint[0] * Math.cos(-this.rotation),
			this.midpoint[1] * Math.cos(-this.rotation) - this.midpoint[0] * Math.sin(-this.rotation)
		];
		this.midpointDiff = [
			this.midpoint[0] - this.midpointNew[0],
			this.midpoint[1] - this.midpointNew[1]
		];
		ctx = gameArea.context;
		ctx.save();
		ctx.translate(this.midpointDiff[0], this.midpointDiff[1]);
		ctx.rotate(this.rotation);
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		ctx.restore();
	}
}

function shipPart(width, height, x, y, source) {
	load.push(this);
	this.image = new Image();
	this.image.src = source;
	this.width = width;
	this.height = height;
	this.x = x - this.width / 2;
	this.y = y - this.height / 2;
	this.rotation = 0;
	this.speed = 0;
	this.update = function() {
		if (this.rotation > 180 * Math.PI / 180) { // Keeps the rotation within the right bounds, so the following statements work at any rotation.
			this.rotation -= 360 * Math.PI / 180;
		} else if (this.rotation < -180 * Math.PI / 180) {
			this.rotation += 360 * Math.PI / 180;
		}
		if (gameArea.keys && gameArea.keys[config.rotateLeftKey]) { // Accelerates the object (to the left) when the left key is pressed
			this.speed += (this.speed + 0.1) * (2 * Math.PI / 180); 
		}
		if (gameArea.keys && gameArea.keys[config.rotateRightKey]) { // Accelerates the object (to the right) when the right key is pressed
			this.speed -= (this.speed + 0.1) * (2 * Math.PI / 180);
		}
		// The following if statements push the ship horizontal (or vertical) when the thrusters are turned on
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation > 0 * Math.PI / 180 && this.rotation <= 10 * Math.PI / 180) {
			this.speed -= (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation >= -10 * Math.PI / 180 && this.rotation < 0 * Math.PI / 180) {
			this.speed += (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation > 10 * Math.PI / 180 && this.rotation < 90 * Math.PI / 180) {
			this.speed += (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation < -10 * Math.PI / 180 && this.rotation > -90 * Math.PI / 180) {
			this.speed -= (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation > 90 * Math.PI / 180 && this.rotation < 170 * Math.PI / 180) {
			this.speed -= (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation < -90 * Math.PI / 180 && this.rotation > -170 * Math.PI / 180) {
			this.speed += (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation >= 170 * Math.PI / 180 && this.rotation < 180 * Math.PI / 180) {
			this.speed += (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation <= -170 * Math.PI / 180 && this.rotation > -180 * Math.PI / 180) {
			this.speed -= (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		this.speed = this.speed * config.rotationDecay; // Deceleration.
		if (this.speed > 2 * Math.PI / 180) { // Limits the maximum speed.
			this.speed = 2 * Math.PI / 180;
		} else if (this.speed < -2 * Math.PI / 180) {
			this.speed = -2 * Math.PI / 180;
		}
		this.rotation += this.speed;
		this.midpoint = [
			(this.x + (this.width + this.x)) / 2, 
			(this.y + (this.height + this.y)) / 2
		];
		this.midpointNew = [
			this.midpoint[1] * Math.sin(-this.rotation) + this.midpoint[0] * Math.cos(-this.rotation),
			this.midpoint[1] * Math.cos(-this.rotation) - this.midpoint[0] * Math.sin(-this.rotation)
		];
		this.midpointDiff = [
			this.midpoint[0] - this.midpointNew[0],
			this.midpoint[1] - this.midpointNew[1]
		];
		ctx = gameArea.context;
		ctx.save();
		ctx.translate(this.midpointDiff[0], this.midpointDiff[1]);
		ctx.rotate(this.rotation);
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		ctx.restore();
	}
}

function shadow(width, height, x, y, source, transparency) {
	if (config.shders == true) {load.push(this);}
	this.image = new Image();
	this.image.src = source;
	this.width = width;
	this.height = height;
	this.x = x - this.width / 2;
	this.y = y - this.height / 2;
	this.transparency = transparency;
	this.update = function() {
		ctx = gameArea.context;
		ctx.save();
		ctx.globalAlpha = this.transparency;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		ctx.restore();
	}	
}

function updateGameArea() {
	gameArea.clear();
	gameArea.getInput();
	gameArea.load(state);
}
